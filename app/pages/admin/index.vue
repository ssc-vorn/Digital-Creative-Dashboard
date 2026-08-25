<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAppStore } from '~/stores/app'
import { useDashboardStore } from '~/stores/dashboard'

const app = useAppStore()
const dashboard = useDashboardStore()
const { data: analytics, status: analyticsStatus, load: loadAnalytics } = useAnalyticsOverview()

const customizeItems = computed<DropdownMenuItem[][]>(() => [
  dashboard.available.length > 0
    ? dashboard.available.map(widget => ({
        label: widget.label,
        icon: 'i-lucide-plus',
        onSelect: () => dashboard.add(widget.key)
      }))
    : [{ label: 'All widgets are on the board', disabled: true }],
  [{ label: 'Reset layout', icon: 'i-lucide-rotate-ccw', onSelect: () => dashboard.reset() }]
])

const SIZE_CLASS: Record<string, string> = {
  full: 'lg:col-span-6',
  half: 'lg:col-span-3',
  third: 'lg:col-span-2'
}
</script>

<template>
  <LayoutAdminPage title="Dashboard" no-breadcrumb>
    <template #actions>
      <UDropdownMenu :items="customizeItems" :content="{ align: 'end' }">
        <UButton label="Customize" icon="i-lucide-layout-grid" color="neutral" variant="ghost" class="hidden sm:inline-flex" />
      </UDropdownMenu>
    </template>

    <div class="mx-auto w-full max-w-7xl">
      <!-- Greeting -->
      <header class="mb-6">
        <ClientOnly>
          <h1 class="type-display">{{ app.greeting }}, {{ app.currentUser.name.split(' ')[0] }}</h1>
          <template #fallback>
            <h1 class="type-display">Welcome back</h1>
          </template>
        </ClientOnly>
        <p class="type-body mt-1 text-muted">Here’s what’s happening across your digital platform.</p>
      </header>

      <!-- KPI row -->
      <section aria-label="Key metrics" class="mb-6">
        <div v-if="analyticsStatus === 'loading' || analyticsStatus === 'idle'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <USkeleton v-for="i in 5" :key="i" class="h-28 w-full" />
        </div>
        <CommonErrorState v-else-if="analyticsStatus === 'error'" @retry="loadAnalytics(true)" />
        <div v-else-if="analytics" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <CommonKpiCard v-for="metric in analytics.kpis" :key="metric.key" :metric="metric" />
        </div>
      </section>

      <!-- Widget board -->
      <TransitionGroup name="fade" tag="div" class="grid grid-cols-1 gap-4 lg:grid-cols-6">
        <DashboardWidgetCard
          v-for="widget in dashboard.widgets"
          :key="widget.key"
          :widget-key="widget.key"
          :title="widget.label"
          :description="widget.description"
          :class="SIZE_CLASS[widget.size]"
        >
          <DashboardWidgetTraffic v-if="widget.key === 'traffic'" />
          <DashboardWidgetLeadsTrend v-else-if="widget.key === 'leads-trend'" />
          <DashboardWidgetFunnel v-else-if="widget.key === 'funnel'" />
          <DashboardWidgetRecentLeads v-else-if="widget.key === 'recent-leads'" />
          <DashboardWidgetActivity v-else-if="widget.key === 'activity'" />
          <DashboardWidgetTopProjects v-else-if="widget.key === 'top-projects'" />
          <DashboardWidgetPublishing v-else-if="widget.key === 'publishing'" />
          <DashboardWidgetTasks v-else-if="widget.key === 'tasks'" />
          <DashboardWidgetSystem v-else-if="widget.key === 'system'" />
        </DashboardWidgetCard>
      </TransitionGroup>

      <UEmpty
        v-if="dashboard.widgets.length === 0"
        icon="i-lucide-layout-grid"
        title="A blank canvas"
        description="Every widget has been removed. Add some back or reset the layout."
        class="py-20"
      >
        <template #actions>
          <UButton label="Reset layout" icon="i-lucide-rotate-ccw" @click="dashboard.reset()" />
        </template>
      </UEmpty>
    </div>
  </LayoutAdminPage>
</template>
