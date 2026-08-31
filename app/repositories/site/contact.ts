import type { ContactInquiry } from '~/types/site'
import { simulateRequest } from '../support'

export const contactRepository = {
  /** Mock submission — future backend swap point (Laravel API → CRM lead). */
  async submitInquiry(inquiry: ContactInquiry): Promise<{ referenceId: string }> {
    await simulateRequest({ mutation: true })
    return { referenceId: `INQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}` }
  }
}
