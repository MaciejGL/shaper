import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function Header({ setIsCreateDialogOpen }: { setIsCreateDialogOpen: (open: boolean) => void }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Exercise Library</h1>
          <p className="text-muted-foreground">
            Manage your exercise database and create reusable exercises for training plans
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2" iconStart={

          <Plus  />
        }>
          Create Exercise
        </Button>
      </div>
    )
}