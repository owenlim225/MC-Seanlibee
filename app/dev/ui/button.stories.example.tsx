import { Button } from "@/components/ui/button";

/** Example-only demo module consumed by `app/dev/ui/page.tsx`. */
export function ButtonStoriesExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button">Primary</Button>
      <Button type="button" variant="secondary">
        Secondary
      </Button>
    </div>
  );
}
