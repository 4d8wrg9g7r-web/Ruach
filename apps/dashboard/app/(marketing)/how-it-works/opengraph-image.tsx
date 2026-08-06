export { OG_IMAGE_SIZE as size } from "../../../lib/marketing/og-image";
export const contentType = "image/png";

import { renderOgImage } from "../../../lib/marketing/og-image";

export default function Image() {
  return renderOgImage("From archive to conversation.");
}
