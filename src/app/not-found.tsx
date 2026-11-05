import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <EmptyState
        title="Lost in space"
        description="This page drifted out of orbit. Let's get you back to somewhere with a view."
        action={
          <>
            <ButtonLink href="/">Go home</ButtonLink>
            <ButtonLink href="/explore" variant="secondary">Open the explorer</ButtonLink>
          </>
        }
      />
    </div>
  );
}
