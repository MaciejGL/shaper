'use client'

import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ChefHat,
  DumbbellIcon,
  FileIcon,
  FilesIcon,
  LayoutDashboardIcon,
  PlusCircleIcon,
  Settings,
  ShieldIcon,
  UserIcon,
  UserRoundCogIcon,
  Users2Icon,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { AnimatedLogo, AnimatedLogoText } from '@/components/animated-logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { TRAINER_LINKS } from '@/constants/user-links'
import {
  GQLUserRole,
  useCreateDraftTemplateMutation,
  useGetClientsQuery,
  useGetTemplatesQuery,
} from '@/generated/graphql-client'
import { FEATURE_FLAGS, useFeatureFlag } from '@/hooks/use-feature-flag'
import { cn } from '@/lib/utils'

type SidebarItemType = {
  title: string
  url: string
  icon: React.ElementType
  disabled?: boolean
  subItems?: SidebarSubItem[]
  action?: {
    icon: React.ElementType
    onClick: () => void
    loading?: boolean
  }
}

type SidebarSubItem = {
  title: string
  url: string
  icon: React.ElementType
}

// Define placeholder data types
const placeholderClients = {
  myClients: Array(2)
    .fill(null)
    .map((_, index) => ({
      id: `client-placeholder-${index}`,
      firstName: 'Loading...',
      lastName: 'Loading...',
      email: 'Loading...',
      image: null,
      role: GQLUserRole.Client,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })),
}

const placeholderTemplates = {
  getTemplates: Array(2)
    .fill(null)
    .map((_, index) => ({
      id: `template-placeholder-${index}`,
      title: 'Loading...',
      description: null,
      isPublic: false,
      isDraft: false,
      weekCount: 0,
      assignedCount: 0,
    })),
}

export function AppSidebar() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isModerator, setIsModerator] = useState(false)
  const { isEnabled: isTeamsEnabled, isLoading: isTeamsFeatureLoading } =
    useFeatureFlag(FEATURE_FLAGS.teams)

  // Check if user is a moderator
  useEffect(() => {
    const checkModeratorStatus = async () => {
      try {
        const response = await fetch(
          '/api/moderator/exercises/list?page=1&limit=1',
        )
        setIsModerator(response.ok)
      } catch {
        setIsModerator(false)
      }
    }

    if (session?.user) {
      checkModeratorStatus()
    }
  }, [session])

  const { data: clients, isPlaceholderData: isPlaceholderClients } =
    useGetClientsQuery(
      { limit: 4, offset: 0 },
      {
        placeholderData: placeholderClients,
        refetchOnWindowFocus: false,
      },
    )

  const { data: templatesData, isPlaceholderData: isPlaceholderTemplates } =
    useGetTemplatesQuery(
      { limit: 3 },
      {
        placeholderData: placeholderTemplates,
        refetchOnWindowFocus: false,
      },
    )

  const { mutate: createDraftTemplate, isPending: isCreatingDraftTemplate } =
    useCreateDraftTemplateMutation({
      onSuccess: (data) => {
        const newPlan = data.createDraftTemplate
        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
        router.push(`/trainer/trainings/creator/${newPlan.id}`)
      },
      onError: (error) => {
        console.error('Failed to create draft template:', error)
      },
    })

  const templates = useMemo(
    () => templatesData?.getTemplates || [],
    [templatesData],
  )

  const items: SidebarItemType[] = useMemo(
    () => [
      {
        title: TRAINER_LINKS.clients.label,
        url: TRAINER_LINKS.clients.href,
        icon: Users2Icon,
        disabled: TRAINER_LINKS.clients.disabled,
        subItems: clients?.myClients.map((client) => ({
          title: client.firstName
            ? `${client.firstName} ${client.lastName}`
            : client.email,
          url: `${TRAINER_LINKS.clients.href}/${client.id}`,
          icon: UserRoundCogIcon,
        })),
      },
      {
        title: TRAINER_LINKS.trainings.label,
        url: TRAINER_LINKS.trainings.href,
        icon: FilesIcon,
        disabled: TRAINER_LINKS.trainings.disabled,
        action: {
          icon: PlusCircleIcon,
          onClick: () => createDraftTemplate({}),
          loading: isCreatingDraftTemplate,
        },
        subItems: templates.map((template) => ({
          title: template.title,
          url: `${TRAINER_LINKS.trainings.href}/creator/${template.id}`,
          icon: FileIcon,
        })),
      },
      {
        title: TRAINER_LINKS.exercises.label,
        url: TRAINER_LINKS.exercises.href,
        icon: DumbbellIcon,
        disabled: TRAINER_LINKS.exercises.disabled,
      },
      {
        title: TRAINER_LINKS.meals.label,
        url: TRAINER_LINKS.meals.href,
        icon: ChefHat,
        disabled: TRAINER_LINKS.meals.disabled,
      },
      ...(isTeamsEnabled && !isTeamsFeatureLoading
        ? [
            {
              title: TRAINER_LINKS.teams.label,
              url: TRAINER_LINKS.teams.href,
              icon: LayoutDashboardIcon,
              disabled: TRAINER_LINKS.teams.disabled,
            },
          ]
        : []),
    ],
    [
      isTeamsEnabled,
      isTeamsFeatureLoading,
      clients,
      templates,
      createDraftTemplate,
      isCreatingDraftTemplate,
    ],
  )

  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  const footerItems: SidebarItemType[] = [
    {
      title: TRAINER_LINKS.profile.label,
      url: TRAINER_LINKS.profile.href,
      icon: UserRoundCogIcon,
      disabled: TRAINER_LINKS.profile.disabled,
    },
    {
      title: TRAINER_LINKS.publicProfile.label,
      url: TRAINER_LINKS.publicProfile.href,
      icon: UserIcon,
      disabled: TRAINER_LINKS.publicProfile.disabled,
    },
    {
      title: TRAINER_LINKS.settings.label,
      url: TRAINER_LINKS.settings.href,
      icon: Settings,
      disabled: TRAINER_LINKS.settings.disabled,
    },
    ...(isModerator
      ? [
          {
            title: TRAINER_LINKS.exerciseManagement.label,
            url: TRAINER_LINKS.exerciseManagement.href,
            icon: DumbbellIcon,
            disabled: TRAINER_LINKS.exerciseManagement.disabled,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: 'Admin',
            url: '/admin',
            icon: ShieldIcon,
            disabled: false,
          },
        ]
      : []),
  ]

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="dark">
      <SidebarHeaderComponent />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarItem
                key={item.title}
                item={item}
                isLoading={isPlaceholderClients || isPlaceholderTemplates}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarItem key={item.title} item={item} isLoading={false} />
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
  const { setOpenMobile, isMobile } = useSidebar()

  const handleMobileNavigation = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarMenuItem className="dark">
      <SidebarMenuButton asChild isActive={isActive} disabled={item.disabled}>
        <Link href={item.url} onClick={handleMobileNavigation} className="dark">
          <item.icon className="text-sidebar-foreground" />
          <span className="text-sidebar-foreground">{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {item.action && (
        <SidebarMenuAction
          onClick={item.action.onClick}
          disabled={item.action.loading}
        >
          <item.action.icon />
        </SidebarMenuAction>
      )}
      {item.subItems && item.subItems.length > 0 && (
        <SidebarMenuSub>
          {item.subItems.map((subItem) => {
            const isSubActive = subItem.url === pathname
            return (
              <SidebarMenuSubItem key={subItem.url}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isSubActive}
                  className={cn(isLoading && 'masked-placeholder-text')}
                >
                  <Link href={subItem.url} onClick={handleMobileNavigation}>
                    <subItem.icon />
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

function SidebarHeaderComponent() {
  const { open } = useSidebar()
  return (
    <SidebarHeader className="flex flex-row items-center overflow-hidden">
      <AnimatedLogo infinite={false} size={open ? 32 : 24} />
      <motion.div
        variants={{
          hidden: {
            opacity: 0,
            transition: {
              duration: 0.1,
            },
          },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.1,
            },
          },
        }}
        initial="hidden"
        animate={open ? 'visible' : 'hidden'}
        className="w-max text-sidebar-foreground"
      >
        <AnimatedLogoText className="whitespace-nowrap" />
      </motion.div>
    </SidebarHeader>
  )
}
