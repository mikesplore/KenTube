import type { SVGProps } from 'react';

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <title>Kenya Tube Insights Logo</title>
    <path d="M5 3l14 9-14 9V3z" fill="white" />
    <path d="M5 3h14v6H5z" fill="#000000" />
    <path d="M5 15h14v6H5z" fill="#008000" />
    <path d="M5 9h14v6H5z" fill="#FF0000" />
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

export default Logo;
