import { Trans } from "next-i18next"
import Script from "next/script"
import { useEffect, useState } from "react"

import { Logo } from "~/components/common/Logo"
import { Platform } from "~/components/site/Platform"
import { SITE_URL } from "~/lib/env"
import { ExpandedCharacter } from "~/lib/types"

import { DarkModeSwitch } from "../common/DarkModeSwitch"
import { UniLink } from "../ui/UniLink"

export const SiteFooter: React.FC<{
  site?: ExpandedCharacter
}> = ({ site }) => {
  const [logoType, setLogoType] = useState<"svg" | "png" | "lottie">("svg")

  useEffect(() => {
    setLogoType("lottie")
  }, [])

  const LogoWithLink = () => {
    return (
      <UniLink
        href={SITE_URL}
        className="inline-flex items-center align-text-top mx-1"
      >
        <Logo type={logoType} width={20} height={20} autoplay={false} />
      </UniLink>
    )
  }

  return (
    <>
      <footer className="text-zinc-500 border-t">
        <div className="max-w-screen-md mx-auto px-5 py-10 text-xs sm:flex justify-between sm:space-x-5 sm:space-y-0 space-y-5">
          <div className="font-medium text-base">
            <span>&copy; </span>
            <UniLink href="/" className="hover:text-accent">
              <span>{site?.metadata?.content?.name}</span>
            </UniLink>
            <span> · </span>
            <Trans
              i18nKey="powered by"
              defaults={"<span>Powered by </span><name/>"}
              components={{
                name: <LogoWithLink />,
                span: <span />,
              }}
              ns="site"
            />
          </div>
          {site?.metadata?.content?.connected_accounts && (
            <div className="sm:-mr-5 sm:block inline-block align-middle mr-4">
              {site?.metadata?.content?.connected_accounts.map(
                (account, index) => {
                  const match = account.match(/:\/\/account:(.*)@(.*)/)
                  if (match) {
                    return (
                      <Platform
                        key={account}
                        platform={match[2]}
                        username={match[1]}
                        className="mr-2 sm:mr-5"
                      ></Platform>
                    )
                  }
                },
              )}
            </div>
          )}
          <DarkModeSwitch />
        </div>
      </footer>
      {site?.metadata?.content?.ga && (
        <div className="xlog-google-analytics">
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=G-${site.metadata?.content?.ga}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-${site.metadata?.content?.ga}');
          `}
          </Script>
        </div>
      )}
    </>
  )
}
