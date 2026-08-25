<script setup lang="ts">
import type { ImportResult, ImportRowResult } from '~/types'
import { leadRepository } from '~/repositories/crm'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ imported: [] }>()

type Step = 'upload' | 'preview' | 'result'
const step = ref<Step>('upload')
const parsing = ref(false)
const importing = ref(false)
const result = ref<ImportResult | null>(null)

interface ParsedRow { name: string, company: string, email: string, service: string, valid: boolean, error?: string }
const rows = ref<ParsedRow[]>([])

function reset() {
  step.value = 'upload'
  rows.value = []
  result.value = null
}

watch(open, (isOpen) => { if (!isOpen) reset() })

async function handleFile(files?: File[] | File | null) {
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return
  parsing.value = true
  try {
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
    const [headerLine, ...dataLines] = lines
    const headers = (headerLine ?? '').split(',').map(h => h.trim().toLowerCase())
    const nameIdx = headers.indexOf('name')
    const companyIdx = headers.indexOf('company')
    const emailIdx = headers.indexOf('email')
    const serviceIdx = headers.indexOf('service')

    rows.value = dataLines.map((line) => {
      const cells = line.split(',').map(c => c.trim())
      const name = nameIdx >= 0 ? cells[nameIdx] ?? '' : ''
      const company = companyIdx >= 0 ? cells[companyIdx] ?? '' : ''
      const email = emailIdx >= 0 ? cells[emailIdx] ?? '' : ''
      const service = serviceIdx >= 0 ? cells[serviceIdx] ?? 'Web Design' : 'Web Design'
      const valid = Boolean(name && company && /.+@.+\..+/.test(email))
      return { name, company, email, service, valid, error: valid ? undefined : 'Missing name/company or invalid email' }
    })
    step.value = 'preview'
  } finally {
    parsing.value = false
  }
}

async function confirmImport() {
  importing.value = true
  try {
    const valid = rows.value.filter(r => r.valid)
    await Promise.all(valid.map(r => leadRepository.create({ name: r.name, company: r.company, email: r.email, service: r.service })))
    const rowResults: ImportRowResult[] = rows.value.map((r, i) => ({
      row: i + 2,
      status: r.valid ? 'valid' : 'invalid',
      summary: `${r.name || '(no name)'} — ${r.company || '(no company)'}`,
      error: r.error
    }))
    result.value = { total: rows.value.length, valid: valid.length, invalid: rows.value.length - valid.length, rows: rowResults }
    step.value = 'result'
    emit('imported')
  } finally {
    importing.value = false
  }
}

function downloadErrorReport() {
  if (!result.value) return
  const invalidRows = result.value.rows.filter(r => r.status === 'invalid')
  const lines = ['row,summary,error', ...invalidRows.map(r => `${r.row},"${r.summary}","${r.error ?? ''}"`)]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'import-errors.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function finish() {
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Import leads" description="Upload a CSV with name, company, email and service columns.">
    <template #body>
      <!-- Upload -->
      <div v-if="step === 'upload'">
        <UFileUpload
          label="Drop a CSV file here"
          description="Columns: name, company, email, service"
          accept=".csv,text/csv"
          class="min-h-40 w-full"
          :disabled="parsing"
          @update:model-value="handleFile"
        />
        <p v-if="parsing" class="mt-3 flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin motion-reduce:animate-none" /> Reading file…
        </p>
      </div>

      <!-- Preview -->
      <div v-else-if="step === 'preview'" class="space-y-3">
        <div class="flex items-center gap-3 text-sm">
          <UBadge color="success" variant="soft">{{ rows.filter(r => r.valid).length }} valid</UBadge>
          <UBadge v-if="rows.some(r => !r.valid)" color="error" variant="soft">{{ rows.filter(r => !r.valid).length }} invalid</UBadge>
          <span class="text-dimmed">{{ rows.length }} rows total</span>
        </div>
        <div class="max-h-72 overflow-y-auto rounded-lg border border-default">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-default bg-elevated/40 text-left">
                <th class="px-3 py-2">Status</th>
                <th class="px-3 py-2">Name</th>
                <th class="px-3 py-2">Company</th>
                <th class="px-3 py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in rows" :key="i" class="border-b border-default last:border-0">
                <td class="px-3 py-2">
                  <UBadge :color="row.valid ? 'success' : 'error'" variant="soft" size="sm">{{ row.valid ? 'Valid' : 'Invalid' }}</UBadge>
                </td>
                <td class="px-3 py-2 text-default">{{ row.name || '—' }}</td>
                <td class="px-3 py-2 text-default">{{ row.company || '—' }}</td>
                <td class="px-3 py-2 text-muted">{{ row.email || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Result -->
      <div v-else-if="step === 'result' && result" class="space-y-4">
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="rounded-lg border border-default p-3">
            <p class="text-lg font-semibold text-highlighted tabular-nums">{{ result.total }}</p>
            <p class="text-xs text-muted">Total rows</p>
          </div>
          <div class="rounded-lg border border-default p-3">
            <p class="text-lg font-semibold text-success tabular-nums">{{ result.valid }}</p>
            <p class="text-xs text-muted">Imported</p>
          </div>
          <div class="rounded-lg border border-default p-3">
            <p class="text-lg font-semibold tabular-nums" :class="result.invalid > 0 ? 'text-error' : 'text-highlighted'">{{ result.invalid }}</p>
            <p class="text-xs text-muted">Skipped</p>
          </div>
        </div>
        <UButton v-if="result.invalid > 0" label="Download Error Report" icon="i-lucide-download" color="neutral" variant="soft" @click="downloadErrorReport" />
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <template v-if="step === 'preview'">
          <UButton label="Back" color="neutral" variant="ghost" @click="step = 'upload'" />
          <UButton label="Confirm Import" icon="i-lucide-check" :loading="importing" :disabled="rows.filter(r => r.valid).length === 0" @click="confirmImport" />
        </template>
        <UButton v-else-if="step === 'result'" label="Done" @click="finish" />
        <UButton v-else label="Cancel" color="neutral" variant="ghost" @click="open = false" />
      </div>
    </template>
  </UModal>
</template>
