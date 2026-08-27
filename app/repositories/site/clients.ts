import type { Client, Testimonial } from '~/types/site'
import { clients, testimonials } from '~/mock-data/site/clients'
import { simulateRequest } from '../support'

export const clientRepository = {
  async getClients(): Promise<Client[]> {
    await simulateRequest()
    return clients
  }
}

export const testimonialRepository = {
  async getTestimonials(): Promise<Testimonial[]> {
    await simulateRequest()
    return testimonials
  }
}
