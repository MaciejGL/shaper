'use client'

import {
  ChevronRight,
  DumbbellIcon,
  HomeIcon,
  NotebookTextIcon,
  UserRoundCogIcon,
  Users2Icon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Divider } from '@/components/divider'
import { navLinkVariants } from '@/components/navbar/nav-link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { TRAINER_LINKS } from '@/constants/user-links'

type SidebarItem = {
  title: string
  url: string
  icon: React.ElementType
  disabled?: boolean
}

export function AppSidebar() {
  const items: SidebarItem[] = [
    {
      title: TRAINER_LINKS.dashboard.label,
      url: TRAINER_LINKS.dashboard.href,
      icon: HomeIcon,
      disabled: TRAINER_LINKS.dashboard.disabled,
    },
    {
      title: TRAINER_LINKS.clients.label,
      url: TRAINER_LINKS.clients.href,
      icon: Users2Icon,
      disabled: TRAINER_LINKS.clients.disabled,
    },
    {
      title: TRAINER_LINKS.trainings.label,
      url: TRAINER_LINKS.trainings.href,
      icon: NotebookTextIcon,
      disabled: TRAINER_LINKS.trainings.disabled,
    },
    {
      title: TRAINER_LINKS.exercises.label,
      url: TRAINER_LINKS.exercises.href,
      icon: DumbbellIcon,
      disabled: TRAINER_LINKS.exercises.disabled,
    },
  ]

  const footerItems = [
    {
      title: TRAINER_LINKS.profile.label,
      url: TRAINER_LINKS.profile.href,
      icon: UserRoundCogIcon,
      disabled: TRAINER_LINKS.profile.disabled,
    },
  ]

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="border-r border-zinc-100 dark:border-zinc-800"
    >
      <SidebarContent className="mt-16">
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <Divider className="mb-2" />
          {footerItems.map((item) => (
            <SidebarItem key={item.title} item={item} />
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarItem({ item }: { item: SidebarItem }) {
  const pathname = usePathname()
  const isActive = item.url === pathname

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild disabled={item.disabled}>
        <Link href={item.url} className={navLinkVariants({ isActive })}>
          <item.icon />
          <span className="font-medium">{item.title}</span>
          {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-60" />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
