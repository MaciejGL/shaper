'use client'

import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { emailTemplates } from './templates'

export default function EmailPreviewPage() {
  const [selectedId, setSelectedId] = React.useState<string>(
    emailTemplates[0].id,
  )

  const selectedTemplate = emailTemplates.find((t) => t.id === selectedId)

  // Group templates by category
  const groupedTemplates = React.useMemo(() => {
    const groups: Record<string, typeof emailTemplates> = {}
    emailTemplates.forEach((template) => {
      if (!groups[template.category]) {
        groups[template.category] = []
      }
      groups[template.category].push(template)
    })
    return groups
  }, [])

  const html = React.useMemo(() => {
    if (!selectedTemplate) return ''
    try {
      const Component = selectedTemplate.component
      return renderToStaticMarkup(<Component {...selectedTemplate.props} />)
    } catch (error) {
      console.error('Failed to render email template:', error)
      return '<div>Error rendering template</div>'
    }
  }, [selectedTemplate])

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Sidebar */}
      <Card className="w-80 shrink-0">
        <CardContent className="p-0">
          <div className="p-4 font-semibold">Email Templates</div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <div className="space-y-6 p-4">
              {Object.entries(groupedTemplates).map(([category, templates]) => (
                <div key={category}>
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {templates.map((template) => (
                      <Button
                        key={template.id}
                        variant={selectedId === template.id ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start text-sm font-normal',
                          selectedId === template.id && 'font-medium',
                        )}
                        onClick={() => setSelectedId(template.id)}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Preview Area */}
      <Card className="flex-1 overflow-hidden bg-slate-100">
        <CardContent className="h-full p-0 flex flex-col">
          <div className="border-b bg-white p-4 flex justify-between items-center">
            <h2 className="font-semibold">
              Preview: {selectedTemplate?.name}
            </h2>
            <div className="text-sm text-muted-foreground">
              ID: {selectedTemplate?.id}
            </div>
          </div>
          <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
             {/* iframe container to simulate email client viewport */}
            <div className="w-full max-w-[600px] h-full bg-white shadow-lg rounded-md overflow-hidden border">
              <iframe
                srcDoc={html}
                title="Email Preview"
                className="w-full h-full border-none bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

