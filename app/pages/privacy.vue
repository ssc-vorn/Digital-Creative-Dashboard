<script setup lang="ts">
definePageMeta({ layout: 'public' })

const { data: settings } = useSiteSettings()

useSeoMeta({
  title: 'Privacy Policy',
  description: 'How 24 Seven Solution Advertising collects, uses, and protects your information.',
  ogTitle: 'Privacy Policy — 24 Seven Solution Advertising',
  ogDescription: 'How 24 Seven Solution Advertising collects, uses, and protects your information.',
  ogImage: '/og/privacy.jpg',
  twitterCard: 'summary_large_image'
})

const sections = [
  {
    heading: 'Overview',
    body: 'This policy explains what information 24 Seven Solution Advertising ("24 Seven," "we," "us") collects when you visit this site, why we collect it, and the choices you have. It applies to this website and the project inquiry process described on our Contact page.'
  },
  {
    heading: 'Information we collect',
    body: 'When you submit a project inquiry, we collect what you provide: your name, email address, company, phone number (optional), and details about your project. When you browse the site, we may collect standard technical information — pages visited, referring site, device and browser type — through the analytics category described below.'
  },
  {
    heading: 'How we use information',
    body: 'We use inquiry information to respond to your request, prepare for a potential engagement, and keep a record of client communications. We use technical browsing information, where enabled, to understand how the site is used and to improve it. We do not sell personal information.'
  },
  {
    heading: 'Cookies & tracking',
    body: 'This site uses a cookie consent system with three categories: Necessary (always on, required for the site to function), Analytics (helps us understand usage), and Marketing (personalizes what we show returning visitors). You can change your preferences at any time from the cookie banner or by clearing your browser\'s local storage for this site.'
  },
  {
    heading: 'Sharing & third parties',
    body: 'We do not share the information you submit through a project inquiry with third parties for their own marketing purposes. We may use service providers (such as email delivery or analytics tools) who process data on our behalf, under agreements that limit their use of it to the services they provide us.'
  },
  {
    heading: 'Data retention',
    body: 'We retain project inquiry information for as long as reasonably necessary to respond to it and, where a client relationship begins, for the duration of that relationship plus a standard record-keeping period afterward. You may request deletion at any time — see Contact Us below.'
  },
  {
    heading: 'Your rights',
    body: 'Depending on where you live, you may have the right to access, correct, or delete the personal information we hold about you, and to object to or restrict certain processing. To exercise any of these rights, contact us using the details below.'
  },
  {
    heading: 'Security',
    body: 'We use reasonable technical and organizational measures to protect the information you share with us. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.'
  },
  {
    heading: 'Changes to this policy',
    body: 'We may update this policy from time to time. Material changes will be reflected by an updated "last modified" date at the top of this page.'
  },
  {
    heading: 'Contact us',
    body: 'Questions about this policy, or requests regarding your information, can be sent to the email address below.'
  }
]
</script>

<template>
  <div class="site-container max-w-3xl pb-24 pt-32 sm:pb-32 sm:pt-40">
    <header class="mb-14">
      <p class="site-eyebrow mb-4">Legal</p>
      <h1 class="site-h1">Privacy Policy</h1>
      <p class="site-caption mt-4">Last updated August 2026</p>
    </header>

    <div class="space-y-10">
      <section v-for="section in sections" :key="section.heading">
        <h2 class="site-h3 mb-3">{{ section.heading }}</h2>
        <p class="site-body-lg">{{ section.body }}</p>
      </section>

      <section>
        <h2 class="site-h3 mb-3">Contact</h2>
        <p class="site-body-lg">
          <a :href="`mailto:${settings?.email}`" class="underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70" :style="{ textDecorationColor: 'var(--brand-accent)' }">
            {{ settings?.email }}
          </a>
          · {{ settings?.address }}
        </p>
      </section>
    </div>
  </div>
</template>
