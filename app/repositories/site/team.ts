import type { TeamMember } from '~/types/site'
import { teamMembers } from '~/mock-data/site/team'
import { simulateRequest } from '../support'

export const teamRepository = {
  async getTeam(): Promise<TeamMember[]> {
    await simulateRequest()
    return teamMembers
  }
}
