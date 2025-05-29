import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsCards({ exercises }: { exercises: any[] }) {
    return (
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">My Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.filter((ex) => ex.createdBy?.id === "user1").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Public Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.filter((ex) => ex.isPublic).length}</div>
          </CardContent>
        </Card>
      </div>        
    )
}