/* eslint-disable @next/next/no-img-element */
import type { HeaderTopbarSocialLink } from "@/lib/cms/headerCms";
import { getTopbarSocialIconClass } from "@/lib/cms/headerCms";

type TopbarSocialIconProps = {
  link: HeaderTopbarSocialLink;
};

export function TopbarSocialIcon({ link }: TopbarSocialIconProps) {
  if (link.imageUrl) {
    return <img src={link.imageUrl} alt="" width={16} height={16} style={{ display: "block" }} />;
  }

  return <i className={getTopbarSocialIconClass(link)} aria-hidden="true" />;
}
