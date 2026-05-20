import SocialProof from '@/components/shadcn-studio/blocks/social-proof-07/social-proof-07'
import { BookOpenIcon, FoldersIcon, UsersIcon, TicketIcon } from "lucide-react"

const metricsData = [
  {
    icon: (
      <BookOpenIcon
      />
    ),
    value: '110+',
    label: 'Blocks'
  },
  {
    icon: (
      <FoldersIcon
      />
    ),
    value: '29',
    label: 'Template'
  },
  {
    icon: (
      <UsersIcon
      />
    ),
    value: '3400',
    label: 'Customers'
  },
  {
    icon: (
      <TicketIcon
      />
    ),
    value: '2844+',
    label: 'Support Ticket'
  }
]

const SocialProofPage = () => {
  return <SocialProof metrics={metricsData} />
}

export default SocialProofPage
