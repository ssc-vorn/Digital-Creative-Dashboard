<script setup lang="ts">
definePageMeta({ layout: 'public' })

const { data: settings } = useSiteSettings()

useSeoMeta({
  title: 'Terms of Service',
  description: 'The terms that govern your use of the 24 Seven Solution Advertising website.',
  ogTitle: 'Terms of Service — 24 Seven Solution Advertising'
})

const sections = [
  {
    heading: 'Acceptance of terms',
    body: 'By accessing this website, you agree to these terms. If you do not agree, please do not use the site. These terms apply to the public website only and do not govern any separate agreement entered into for client work, which is set out in its own contract.'
  },
  {
    heading: 'Use of the site',
    body: 'You may browse this site and submit a project inquiry for legitimate business purposes. You agree not to misuse the site — including attempting to disrupt it, scrape it at scale, or submit false or malicious information through the contact form.'
  },
  {
    heading: 'Intellectual property',
    body: 'All content on this site — including case studies, images, copy, and the 24 Seven name and mark — is the property of 24 Seven Solution Advertising or its clients and is protected by copyright and trademark law. Case study work is shown with client permission and remains the intellectual property of the respective client unless otherwise agreed.'
  },
  {
    heading: 'User submissions',
    body: 'Information you submit through the project inquiry form is used as described in our Privacy Policy. By submitting an inquiry, you confirm the information provided is accurate and that you have the authority to request work on behalf of the company named.'
  },
  {
    heading: 'Third-party links',
    body: 'This site may link to third-party sites, including social platforms. We are not responsible for the content or privacy practices of sites we do not operate.'
  },
  {
    heading: 'Disclaimer of warranties',
    body: 'This site and its content are provided "as is" without warranties of any kind, express or implied. We do not guarantee the site will be uninterrupted, error-free, or available at all times.'
  },
  {
    heading: 'Limitation of liability',
    body: 'To the fullest extent permitted by law, 24 Seven Solution Advertising is not liable for any indirect, incidental, or consequential damages arising from your use of this site.'
  },
  {
    heading: 'Governing law',
    body: 'These terms are governed by the laws of the State of California, without regard to its conflict-of-law principles.'
  },
  {
    heading: 'Changes to these terms',
    body: 'We may update these terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the updated terms.'
  }
]
</script>

<template>
  <div class="site-container max-w-3xl pb-24 pt-32 sm:pb-32 sm:pt-40">
    <header class="mb-14">
      <p class="site-eyebrow mb-4">Legal</p>
      <h1 class="site-h1">Terms of Service</h1>
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
