'use client'

import {
  ChevronRight,
  DumbbellIcon,
  FileIcon,
  FilesIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  UserRoundCogIcon,
  Users2Icon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { Divider } from '@/components/divider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { TRAINER_LINKS } from '@/constants/user-links'
import {
  useGetClientsQuery,
  useGetTemplatesQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

type SidebarItemType = {
  title: string
  url: string
  icon: React.ElementType
  disabled?: boolean
  subItems?: SidebarSubItem[]
}

type SidebarSubItem = {
  title: string
  url: string
  icon: React.ElementType
  disabled?: boolean
}

// Define placeholder data types
const placeholderClients = {
  myClients: Array(2).fill({
    id: 'placeholder' + Math.random(),
    firstName: 'Loading...',
    lastName: 'Loading...',
    email: 'Loading...',
    image: null,
    role: 'CLIENT',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }),
}

const placeholderTemplates = {
  getTemplates: Array(2).fill({
    id: 'placeholder' + Math.random(),
    title: 'Loading...',
    description: null,
    isPublic: false,
    isDraft: false,
    weekCount: 0,
    assignedCount: 0,
  }),
}

export function AppSidebar() {
  const { data: clients, isPlaceholderData: isPlaceholderClients } =
    useGetClientsQuery(undefined, {
      placeholderData: placeholderClients,
    })

  const { data: templatesData, isPlaceholderData: isPlaceholderTemplates } =
    useGetTemplatesQuery(undefined, {
      placeholderData: placeholderTemplates,
    })

  const templates = useMemo(
    () => templatesData?.getTemplates || [],
    [templatesData],
  )

  const items: SidebarItemType[] = useMemo(
    () => [
      // Dashboard item
      {
        title: TRAINER_LINKS.dashboard.label,
        url: TRAINER_LINKS.dashboard.href,
        icon: LayoutDashboardIcon,
        disabled: TRAINER_LINKS.dashboard.disabled,
      },
      // Clients item
      {
        title: TRAINER_LINKS.clients.label,
        url: TRAINER_LINKS.clients.href,
        icon: Users2Icon,
        disabled: TRAINER_LINKS.clients.disabled,
        subItems: clients?.myClients.map((client) => ({
          title: `${client.firstName} ${client.lastName}`,
          url: TRAINER_LINKS.clients.href + `/${client.id}`,
          icon: UserRoundCogIcon,
          disabled: false,
        })),
      },
      // Trainings item
      {
        title: TRAINER_LINKS.trainings.label,
        url: TRAINER_LINKS.trainings.href,
        icon: FilesIcon,
        disabled: TRAINER_LINKS.trainings.disabled,
        subItems: [
          {
            title: 'Create',
            url: TRAINER_LINKS.trainings.href + '/creator/new',
            icon: PlusCircleIcon,
            disabled: false,
          },
          ...templates.map((template) => ({
            title: template.title,
            url: TRAINER_LINKS.trainings.href + `/creator/${template.id}`,
            icon: FileIcon,
            disabled: false,
          })),
        ],
      },
      // Exercises item
      {
        title: TRAINER_LINKS.exercises.label,
        url: TRAINER_LINKS.exercises.href,
        icon: DumbbellIcon,
        disabled: TRAINER_LINKS.exercises.disabled,
      },
    ],
    [clients, templates],
  )

  const footerItems = [
    {
      title: TRAINER_LINKS.profile.label,
      url: TRAINER_LINKS.profile.href,
      icon: UserRoundCogIcon,
      disabled: TRAINER_LINKS.profile.disabled,
    },
  ]

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent className="mt-16">
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item, index) => (
              <SidebarItem
                key={item.title + index}
                item={item}
                isLoading={isPlaceholderClients || isPlaceholderTemplates}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <Divider className="mb-2" />
          {footerItems.map((item, index) => (
            <SidebarItem
              key={item.title + index}
              item={item}
              isLoading={false}
            />
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarItem({
  item,
  isLoading,
}: {
  item: SidebarItemType
  isLoading: boolean
}) {
  const pathname = usePathname()
  const isActive = item.url === pathname

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild disabled={item.disabled} size="md">
        <Link href={item.url} className="inline-flex py-4">
          <item.icon />
          <span>{item.title}</span>
          {isActive && <ChevronRight className="ml-auto size-4 opacity-60" />}
        </Link>
      </SidebarMenuButton>
      <SidebarMenuSub>
        {item.subItems?.map((subItem, index) => (
          <SidebarMenuSubItem key={subItem.title + index}>
            <SidebarMenuSubButton asChild>
              <Link
                href={subItem.url}
                className={cn('', isLoading && 'masked-placeholder-text')}
              >
                <subItem.icon />
                <span>{subItem.title}</span>
                {subItem.url === pathname && (
                  <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                )}
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ))}
      </SidebarMenuSub>
    </SidebarMenuItem>
  )
}
