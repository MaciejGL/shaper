'use client'

import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ChevronRight,
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
import { Divider } from '@/components/divider'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
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
  url?: string
  onClick?: () => void
  loading?: boolean
  icon: React.ElementType
  disabled?: boolean
  subItems?: SidebarSubItem[]
}

type SidebarSubItem = {
  title: string
  url?: string
  onClick?: () => void
  loading?: boolean
  icon: React.ElementType
  disabled?: boolean
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
        console.error('❌ Failed to create draft template:', error)
      },
    })

  const templates = useMemo(
    () => templatesData?.getTemplates || [],
    [templatesData],
  )

  const items: SidebarItemType[] = useMemo(
    () => [
      // Clients item
      {
        title: TRAINER_LINKS.clients.label,
        url: TRAINER_LINKS.clients.href,
        icon: Users2Icon,
        disabled: TRAINER_LINKS.clients.disabled,
        subItems: clients?.myClients.map((client) => ({
          title: client.firstName
            ? `${client.firstName} ${client.lastName}`
            : client.email,
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
            onClick: () => createDraftTemplate({}),
            icon: PlusCircleIcon,
            loading: isCreatingDraftTemplate,
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
      // Teams item - only show if feature flag is enabled and not loading
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

  const footerItems = [
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
    // Exercise Management item (for moderators only)
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
    isAdmin && {
      title: 'Admin',
      url: '/admin',
      icon: ShieldIcon,
      disabled: false,
    },
  ].filter(Boolean) as SidebarItemType[]

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeaderComponent />
      <SidebarContent className="mt-8">
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
        <SidebarFooter>
          <SidebarGroupContent>
            <Divider className="mb-2" />
            <SidebarMenu>
              {footerItems.map((item, index) => (
                <SidebarItem
                  key={item.title + index}
                  item={item}
                  isLoading={false}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarFooter>
      </SidebarContent>
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

  // Helper function to close mobile sidebar on navigation
  const handleMobileNavigation = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild disabled={item.disabled} size="md">
        {item.url ? (
          <Link
            href={item.url}
            className="inline-flex py-4"
            onClick={handleMobileNavigation}
            scroll
          >
            <item.icon />
            <span>{item.title}</span>
            {isActive && <ChevronRight className="ml-auto size-4 opacity-60" />}
          </Link>
        ) : (
          <Button
            onClick={item.onClick}
            variant="variantless"
            size="lg"
            className="inline-flex w-full text-left justify-start pl-0"
            disabled={item.disabled}
            loading={item.loading}
          >
            <item.icon />
            <span>{item.title}</span>
            {isActive && <ChevronRight className="ml-auto size-4 opacity-60" />}
          </Button>
        )}
      </SidebarMenuButton>
      {item.subItems && item.subItems.length > 0 && (
        <SidebarMenuSub>
          {item.subItems.map((subItem, index) => (
            <SidebarMenuSubItem key={subItem.title + index}>
              <SidebarMenuSubButton asChild size="md">
                {subItem.url ? (
                  <Link
                    href={subItem.url}
                    className={cn(
                      'w-full',
                      isLoading && 'masked-placeholder-text',
                    )}
                    onClick={handleMobileNavigation}
                  >
                    <subItem.icon />
                    <span className="truncate">{subItem.title}</span>
                    {subItem.url === pathname && (
                      <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                    )}
                  </Link>
                ) : (
                  <Button
                    onClick={subItem.onClick}
                    variant="variantless"
                    className="inline-flex w-full text-left justify-start [&_svg]:size-4 pl-2"
                    disabled={subItem.disabled}
                    loading={subItem.loading}
                    iconStart={<subItem.icon />}
                  >
                    <span>{subItem.title}</span>
                  </Button>
                )}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
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
        className="w-max"
      >
        <AnimatedLogoText className="whitespace-nowrap" />
      </motion.div>
    </SidebarHeader>
  )
}
