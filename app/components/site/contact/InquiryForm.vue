<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import type { ContactInquiry, ProjectNeed } from '~/types/site'
import { contactRepository } from '~/repositories/site/contact'

const { track } = useAnalyticsEvents()

const STEP_LABELS = ['What you need', 'Your project', 'Timeline', 'Budget', 'Your details', 'Review']
const TOTAL_STEPS = STEP_LABELS.length

const NEED_OPTIONS: { value: ProjectNeed, icon: string, description: string }[] = [
  { value: 'Branding', icon: 'i-lucide-palette', description: 'New identity, refresh, or brand guidelines' },
  { value: 'Digital', icon: 'i-lucide-monitor-smartphone', description: 'A website, product, or digital experience' },
  { value: 'Campaign', icon: 'i-lucide-megaphone', description: 'An integrated or channel-specific campaign' },
  { value: 'Social', icon: 'i-lucide-share-2', description: 'Always-on content or community management' },
  { value: 'Production', icon: 'i-lucide-clapperboard', description: 'Film, photography, or motion' },
  { value: 'Strategy', icon: 'i-lucide-compass', description: 'Positioning, naming, or brand strategy' },
  { value: 'Other', icon: 'i-lucide-sparkles', description: 'Something else — tell us more' }
]

const NEED_FOLLOWUP: Partial<Record<ProjectNeed, { question: string, options: string[] }>> = {
  Branding: { question: 'What best describes this?', options: ['New identity', 'Brand refresh', 'Naming', 'Guidelines & systemization'] },
  Digital: { question: 'What are we building?', options: ['Website', 'Product / app', 'Internal tool', 'Not sure yet'] },
  Campaign: { question: 'Which channels matter most?', options: ['Paid social', 'Paid search', 'Out-of-home', 'Email', 'Integrated / all of the above'] },
  Social: { question: 'What’s the focus?', options: ['Content strategy', 'Community management', 'Creator partnerships'] },
  Production: { question: 'What do you need produced?', options: ['Film', 'Photography', 'Motion / animation'] },
  Strategy: { question: 'What stage are you at?', options: ['Just starting out', 'Have a direction, need it sharpened', 'Ready for a refresh'] }
}

const TIMELINE_OPTIONS = ['ASAP', '1–3 months', '3–6 months', '6+ months', 'Not sure yet']
const BUDGET_OPTIONS = ['Under $25K', '$25K – $75K', '$75K – $150K', '$150K+', 'Let’s discuss']

const emptyForm: ContactInquiry = {
  need: '',
  needFollowUp: '',
  projectDetails: '',
  timeline: '',
  budget: '',
  name: '',
  email: '',
  company: '',
  phone: ''
}

const form = useLocalStorage<ContactInquiry>('site-contact-draft', { ...emptyForm }, { initOnMounted: true })
const step = useLocalStorage('site-contact-step', 1, { initOnMounted: true })
const started = ref(false)
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const submitError = ref<string | null>(null)
const submitted = ref(false)
const referenceId = ref<string | null>(null)
const showResumeBanner = ref(false)
/** Honeypot: real users never see or fill this field; a filled value marks the submission as a bot. */
const honeypot = ref('')

onMounted(async () => {
  await nextTick()
  if (step.value > 1) showResumeBanner.value = true
})

function discardDraft() {
  form.value = { ...emptyForm }
  step.value = 1
  showResumeBanner.value = false
}

const followUp = computed(() => (form.value.need ? NEED_FOLLOWUP[form.value.need] : undefined))

function validateStep(current: number): boolean {
  const next: Record<string, string> = {}
  if (current === 1 && !form.value.need) next.need = 'Choose what you need to continue.'
  if (current === 2) {
    if (followUp.value && !form.value.needFollowUp) next.needFollowUp = 'Pick one to continue.'
    if (form.value.projectDetails.trim().length < 10) next.projectDetails = 'Give us a few sentences so we can prepare properly.'
  }
  if (current === 3 && !form.value.timeline) next.timeline = 'Select a timeline to continue.'
  if (current === 4 && !form.value.budget) next.budget = 'Select a budget range to continue.'
  if (current === 5) {
    if (!form.value.name.trim()) next.name = 'Your name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) next.email = 'Enter a valid email address.'
  }
  errors.value = next
  return Object.keys(next).length === 0
}

function selectNeed(value: ProjectNeed) {
  form.value.need = value
  form.value.needFollowUp = ''
  errors.value.need = ''
}

function goNext() {
  if (!validateStep(step.value)) return
  if (step.value === 1 && !started.value) {
    started.value = true
    track('contact_start')
  }
  track('contact_step_complete', { step: step.value, label: STEP_LABELS[step.value - 1] })
  step.value = Math.min(TOTAL_STEPS, step.value + 1)
}

function goBack() {
  step.value = Math.max(1, step.value - 1)
}

function editStep(target: number) {
  step.value = target
}

async function submit() {
  if (!validateStep(5)) {
    step.value = 5
    return
  }
  if (honeypot.value) return
  submitting.value = true
  submitError.value = null
  try {
    const result = await contactRepository.submitInquiry(form.value)
    referenceId.value = result.referenceId
    submitted.value = true
    track('contact_submit', { need: form.value.need })
    form.value = { ...emptyForm }
    step.value = 1
    started.value = false
    showResumeBanner.value = false
  } catch {
    submitError.value = 'Something went wrong sending your inquiry. Your answers are saved — please try again.'
  } finally {
    submitting.value = false
  }
}

function startOver() {
  submitted.value = false
  referenceId.value = null
}
</script>

<template>
  <div>
    <div v-if="submitted" class="py-8 text-center sm:py-16">
      <span class="mx-auto flex size-16 items-center justify-center rounded-full" style="background-color: var(--brand-accent)">
        <UIcon name="i-lucide-check" class="size-7" style="color: var(--brand-accent-ink)" />
      </span>
      <h2 class="site-h1 mt-8">Got it — thank you.</h2>
      <p class="site-body-lg mx-auto mt-4 max-w-md">
        We’ll read every word before we reply, usually within one business day. Reference
        <span class="font-medium" style="color: var(--brand-ink)">{{ referenceId }}</span>.
      </p>
      <div class="mt-10 flex flex-wrap justify-center gap-4">
        <NuxtLink to="/work" class="site-btn-primary">
          See our work <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
        <button type="button" class="site-btn-ghost" @click="startOver">
          Send another inquiry
        </button>
      </div>
    </div>

    <div v-else>
      <div
        v-if="showResumeBanner"
        class="mb-8 flex items-center justify-between gap-4 rounded-sm border p-4"
        :style="{ borderColor: 'var(--brand-border)' }"
      >
        <p class="site-body text-sm">Welcome back — we saved your progress.</p>
        <button type="button" class="site-caption shrink-0 underline underline-offset-4" @click="discardDraft">
          Start over
        </button>
      </div>

      <div class="mb-10">
        <div class="mb-3 flex items-center justify-between">
          <p class="site-caption">Step {{ step }} of {{ TOTAL_STEPS }} · {{ STEP_LABELS[step - 1] }}</p>
        </div>
        <div class="h-1 w-full overflow-hidden rounded-full" style="background-color: var(--brand-border)">
          <div
            class="h-full rounded-full transition-[width] duration-300 ease-out"
            :style="{ backgroundColor: 'var(--brand-accent)', width: `${(step / TOTAL_STEPS) * 100}%` }"
          />
        </div>
      </div>

      <Transition name="fade" mode="out-in">
        <!-- Step 1: need -->
        <div v-if="step === 1" key="1">
          <h2 class="site-h2 mb-6">What do you need?</h2>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              v-for="option in NEED_OPTIONS"
              :key="option.value"
              type="button"
              class="flex items-start gap-3 rounded-sm border p-4 text-left transition-colors"
              :style="form.need === option.value
                ? { borderColor: 'var(--brand-accent)', backgroundColor: 'color-mix(in oklab, var(--brand-accent) 10%, transparent)' }
                : { borderColor: 'var(--brand-border)' }"
              @click="selectNeed(option.value)"
            >
              <UIcon :name="option.icon" class="mt-0.5 size-5 shrink-0" style="color: var(--brand-accent)" />
              <span>
                <span class="block text-sm font-semibold">{{ option.value }}</span>
                <span class="site-caption mt-0.5 block">{{ option.description }}</span>
              </span>
            </button>
          </div>
          <p v-if="errors.need" class="mt-3 text-sm text-red-500" role="alert">{{ errors.need }}</p>
        </div>

        <!-- Step 2: project details -->
        <div v-else-if="step === 2" key="2">
          <h2 class="site-h2 mb-6">Tell us about your project.</h2>

          <div v-if="followUp" class="mb-8">
            <p class="type-label mb-3">{{ followUp.question }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in followUp.options"
                :key="opt"
                type="button"
                :class="form.needFollowUp === opt ? 'site-pill-active' : 'site-pill'"
                @click="form.needFollowUp = opt; errors.needFollowUp = ''"
              >
                {{ opt }}
              </button>
            </div>
            <p v-if="errors.needFollowUp" class="mt-2 text-sm text-red-500" role="alert">{{ errors.needFollowUp }}</p>
          </div>

          <label class="type-label mb-3 block" for="project-details">Tell us more</label>
          <textarea
            id="project-details"
            v-model="form.projectDetails"
            rows="6"
            placeholder="What are you trying to achieve? Who's it for? Any context that would help us prepare."
            class="site-body-lg w-full resize-none border-0 border-b bg-transparent py-2 outline-none placeholder:opacity-50 focus:border-current"
            :style="{ borderColor: 'var(--brand-border)' }"
          />
          <p v-if="errors.projectDetails" class="mt-2 text-sm text-red-500" role="alert">{{ errors.projectDetails }}</p>
        </div>

        <!-- Step 3: timeline -->
        <div v-else-if="step === 3" key="3">
          <h2 class="site-h2 mb-6">What’s your timeline?</h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in TIMELINE_OPTIONS"
              :key="opt"
              type="button"
              :class="form.timeline === opt ? 'site-pill-active' : 'site-pill'"
              @click="form.timeline = opt; errors.timeline = ''"
            >
              {{ opt }}
            </button>
          </div>
          <p v-if="errors.timeline" class="mt-3 text-sm text-red-500" role="alert">{{ errors.timeline }}</p>
        </div>

        <!-- Step 4: budget -->
        <div v-else-if="step === 4" key="4">
          <h2 class="site-h2 mb-6">What’s the budget range?</h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in BUDGET_OPTIONS"
              :key="opt"
              type="button"
              :class="form.budget === opt ? 'site-pill-active' : 'site-pill'"
              @click="form.budget = opt; errors.budget = ''"
            >
              {{ opt }}
            </button>
          </div>
          <p v-if="errors.budget" class="mt-3 text-sm text-red-500" role="alert">{{ errors.budget }}</p>
        </div>

        <!-- Step 5: contact details -->
        <div v-else-if="step === 5" key="5">
          <h2 class="site-h2 mb-6">How can we reach you?</h2>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label class="type-label mb-2 block" for="c-name">Name *</label>
              <input id="c-name" v-model="form.name" type="text" class="site-body-lg w-full border-0 border-b bg-transparent py-2 outline-none focus:border-current" :style="{ borderColor: 'var(--brand-border)' }">
              <p v-if="errors.name" class="mt-1 text-sm text-red-500" role="alert">{{ errors.name }}</p>
            </div>
            <div>
              <label class="type-label mb-2 block" for="c-email">Email *</label>
              <input id="c-email" v-model="form.email" type="email" class="site-body-lg w-full border-0 border-b bg-transparent py-2 outline-none focus:border-current" :style="{ borderColor: 'var(--brand-border)' }">
              <p v-if="errors.email" class="mt-1 text-sm text-red-500" role="alert">{{ errors.email }}</p>
            </div>
            <div>
              <label class="type-label mb-2 block" for="c-company">Company</label>
              <input id="c-company" v-model="form.company" type="text" class="site-body-lg w-full border-0 border-b bg-transparent py-2 outline-none focus:border-current" :style="{ borderColor: 'var(--brand-border)' }">
            </div>
            <div>
              <label class="type-label mb-2 block" for="c-phone">Phone</label>
              <input id="c-phone" v-model="form.phone" type="tel" class="site-body-lg w-full border-0 border-b bg-transparent py-2 outline-none focus:border-current" :style="{ borderColor: 'var(--brand-border)' }">
            </div>
          </div>

          <div class="sr-only" aria-hidden="true">
            <label for="c-website">Website</label>
            <input id="c-website" v-model="honeypot" type="text" tabindex="-1" autocomplete="off">
          </div>
        </div>

        <!-- Step 6: review -->
        <div v-else key="6">
          <h2 class="site-h2 mb-6">Review your inquiry.</h2>
          <dl class="divide-y" :style="{ borderColor: 'var(--brand-border)' }">
            <div class="flex items-start justify-between gap-4 py-4">
              <div>
                <dt class="site-caption">What you need</dt>
                <dd class="mt-1">{{ form.need }}<template v-if="form.needFollowUp"> · {{ form.needFollowUp }}</template></dd>
              </div>
              <button type="button" class="site-caption underline underline-offset-4" @click="editStep(1)">Edit</button>
            </div>
            <div class="flex items-start justify-between gap-4 py-4">
              <div class="min-w-0">
                <dt class="site-caption">Your project</dt>
                <dd class="mt-1 line-clamp-3">{{ form.projectDetails }}</dd>
              </div>
              <button type="button" class="site-caption shrink-0 underline underline-offset-4" @click="editStep(2)">Edit</button>
            </div>
            <div class="flex items-start justify-between gap-4 py-4">
              <div>
                <dt class="site-caption">Timeline</dt>
                <dd class="mt-1">{{ form.timeline }}</dd>
              </div>
              <button type="button" class="site-caption underline underline-offset-4" @click="editStep(3)">Edit</button>
            </div>
            <div class="flex items-start justify-between gap-4 py-4">
              <div>
                <dt class="site-caption">Budget</dt>
                <dd class="mt-1">{{ form.budget }}</dd>
              </div>
              <button type="button" class="site-caption underline underline-offset-4" @click="editStep(4)">Edit</button>
            </div>
            <div class="flex items-start justify-between gap-4 py-4">
              <div>
                <dt class="site-caption">Contact</dt>
                <dd class="mt-1">{{ form.name }} · {{ form.email }}<template v-if="form.company"> · {{ form.company }}</template></dd>
              </div>
              <button type="button" class="site-caption underline underline-offset-4" @click="editStep(5)">Edit</button>
            </div>
          </dl>

          <p v-if="submitError" class="mt-4 text-sm text-red-500" role="alert">{{ submitError }}</p>
        </div>
      </Transition>

      <div class="mt-10 flex items-center justify-between">
        <button
          v-if="step > 1"
          type="button"
          class="site-btn-ghost"
          :disabled="submitting"
          @click="goBack"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4" /> Back
        </button>
        <span v-else />

        <button v-if="step < TOTAL_STEPS" type="button" class="site-btn-primary" @click="goNext">
          Continue <UIcon name="i-lucide-arrow-right" class="size-4" />
        </button>
        <button v-else type="button" class="site-btn-primary" :disabled="submitting" @click="submit">
          <UIcon v-if="submitting" name="i-lucide-loader-circle" class="size-4 animate-spin" />
          {{ submitting ? 'Sending…' : 'Send inquiry' }}
        </button>
      </div>
    </div>
  </div>
</template>
