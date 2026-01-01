import type { FC } from "hono/jsx";

export const Footer: FC = () => {
  return (
    <footer class="border-t mt-8 py-3">
      <div class="container mx-auto px-4 text-center text-xs text-muted-foreground">
        <p>
          Powered by{" "}
          <a
            href="/"
            class="text-primary hover:underline"
          >
            Akraft
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
