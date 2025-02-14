import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"

import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import { Titles } from "~/components/common/Titles"
import { Avatar } from "~/components/ui/Avatar"
import { useDate } from "~/hooks/useDate"
import type { ExpandedCharacter } from "~/lib/types"
import { cn } from "~/lib/utils"
import * as siteModel from "~/models/site.model"

export const CharacterCard: React.FC<{
  siteId?: string
  address?: string
  open?: boolean
  setButtonLoading?: (loading: boolean) => void
  hideFollowButton?: boolean
  simple?: boolean
  style?: "flat" | "normal"
}> = ({
  siteId,
  address,
  open,
  setButtonLoading,
  hideFollowButton,
  simple,
  style,
}) => {
  const [firstOpen, setFirstOpen] = useState("")
  const [site, setSite] = useState<ExpandedCharacter>()
  const date = useDate()
  const { t } = useTranslation("common")

  useEffect(() => {
    if (open && (firstOpen !== (siteId || address) || !site)) {
      if (siteId || address) {
        setFirstOpen(siteId || address || "")
        if (siteId) {
          siteModel.getSite(siteId).then((site) => setSite(site))
        } else if (address) {
          siteModel.getSiteByAddress(address).then((site) => setSite(site))
        }
      } else {
        setSite(undefined)
      }
    }
  }, [open, firstOpen, siteId, address, site])

  return (
    <span
      className={cn(
        "border-border border rounded-lg text-sm block cursor-default",
        style === "flat" ? "" : "p-4 bg-white shadow-xl",
        simple ? "space-y-1" : "space-y-2",
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {site ? (
        <>
          <span className="flex items-center justify-between">
            <Avatar
              images={site?.metadata?.content?.avatars || []}
              name={site?.metadata?.content?.name}
              size={45}
            />
            {!hideFollowButton && (
              <FollowingButton
                site={site}
                size="sm"
                loadingStatusChange={(status) => setButtonLoading?.(status)}
              />
            )}
          </span>
          <span className="flex items-center space-x-1">
            <span className="font-bold text-base text-zinc-800">
              {site?.metadata?.content?.name}
            </span>
            <Titles characterId={+(site?.characterId || "")} />
            <span className="text-gray-600">@{site?.handle}</span>
          </span>
          {site?.metadata?.content?.bio && (
            <span className="text-gray-600 line-clamp-4">
              {site?.metadata?.content?.bio}
            </span>
          )}
          {!simple && (
            <span className="block">
              <FollowingCount
                characterId={site.characterId}
                disableList={true}
              />
            </span>
          )}
          {!simple && site?.createdAt && (
            <span className="block text-gray-500">
              <time dateTime={date.formatToISO(site.createdAt)}>
                {t("joined ago", {
                  time: date.dayjs
                    .duration(
                      date.dayjs(site.createdAt).diff(date.dayjs(), "minute"),
                      "minute",
                    )
                    .humanize(),
                })}
              </time>
            </span>
          )}
        </>
      ) : (
        <>{t("Loading")}...</>
      )}
    </span>
  )
}
