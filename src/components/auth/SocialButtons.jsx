import { Button } from "../ui";

export function SocialButtons({ onGoogle, onGithub }) {
  return (
    <div className="flex flex-col gap-2.5"> 
      <Button type="button" variant="social" onClick={onGoogle}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M15.68 8.18c0-.58-.05-1.13-.15-1.66H8v3.14h4.31a3.69 3.69 0 0 1-1.6 2.42v2h2.59c1.52-1.4 2.38-3.46 2.38-5.9z"
          />
          <path
            fill="currentColor"
            d="M8 16c2.16 0 3.97-.72 5.3-1.92l-2.59-2c-.72.48-1.64.77-2.71.77-2.08 0-3.85-1.4-4.48-3.29H.85v2.07A8 8 0 0 0 8 16z"
          />
          <path fill="currentColor" d="M3.52 9.56A4.8 4.8 0 0 1 3.27 8c0-.54.09-1.07.25-1.56V4.37H.85A8 8 0 0 0 0 8c0 1.29.31 2.51.85 3.63l2.67-2.07z" />
          <path
            fill="currentColor"
            d="M8 3.18c1.18 0 2.23.4 3.06 1.2l2.3-2.3C11.96.86 10.15 0 8 0A8 8 0 0 0 .85 4.37l2.67 2.07C4.15 4.58 5.92 3.18 8 3.18z"
          />
        </svg>
        Continue with Google
      </Button>
      <Button type="button" variant="social" onClick={onGithub}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.5c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.23 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.96 0-.87.31-1.59.83-2.14-.08-.2-.36-1.02.08-2.13 0 0 .67-.22 2.2.83a7.6 7.6 0 0 1 4 0c1.53-1.05 2.2-.83 2.2-.83.44 1.11.16 1.93.08 2.13.52.55.83 1.27.83 2.14 0 3.08-1.87 3.75-3.66 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0z"
          />
        </svg>
        Continue with GitHub
      </Button>
    </div>
  );
}
