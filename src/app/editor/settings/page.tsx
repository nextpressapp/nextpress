import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditorSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Editor Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="defaultCategory">Default Category</Label>
              <Input id="defaultCategory" defaultValue="Uncategorized" />
            </div>
            <div>
              <Label htmlFor="postsPerPage">Posts Per Page</Label>
              <Input id="postsPerPage" type="number" defaultValue="10" />
            </div>
            <Button type="submit">Save Preferences</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
