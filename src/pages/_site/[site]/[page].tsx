import { GetServerSideProps } from "next"
import { ReactElement } from "react"

import { QueryClient } from "@tanstack/react-query"

import { SiteLayout } from "~/components/site/SiteLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { SitePage } from "~/components/site/SitePage"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const queryClient = new QueryClient()
    const domainOrSubdomain = ctx.params!.site as string
    const pageSlug = ctx.params!.page as string

    const { props: layoutProps } = await getLayoutServerSideProps(
      ctx,
      queryClient,
      {
        useStat: true,
      },
    )

    return {
      props: {
        ...layoutProps,
        domainOrSubdomain,
        pageSlug,
      },
    }
  },
)

function SitePagePage({
  domainOrSubdomain,
  pageSlug,
}: {
  domainOrSubdomain: string
  pageSlug: string
}) {
  const site = useGetSite(domainOrSubdomain)
  const page = useGetPage({
    characterId: site.data?.characterId,
    slug: pageSlug,
    useStat: true,
  })

  return (
    <SitePage page={page.data || undefined} site={site.data || undefined} />
  )
}

SitePagePage.getLayout = (page: ReactElement) => {
  return (
    <SiteLayout useStat={true} type="post">
      {page}
    </SiteLayout>
  )
}

export default SitePagePage
