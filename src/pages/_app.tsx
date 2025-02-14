import "aplayer-react/dist/index.css"
import { Network } from "crossbell.js"
import { appWithTranslation } from "next-i18next"
import NextNProgress from "nextjs-progressbar"
import { Toaster } from "react-hot-toast"
import { AppPropsWithLayout } from "types/next"
import { WagmiConfig, createClient } from "wagmi"

import {
  ConnectKitProvider,
  getDefaultClientConfig,
} from "@crossbell/connect-kit"
import {
  NotificationModal,
  NotificationModalColorScheme,
} from "@crossbell/notification"
import { Hydrate, QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"

import "~/css/main.css"
// eslint-disable-next-line import/no-unresolved
import { useDarkMode } from "~/hooks/useDarkMode"
import { useMobileLayout } from "~/hooks/useMobileLayout"
import { APP_NAME, IPFS_GATEWAY } from "~/lib/env"
import { toGateway } from "~/lib/ipfs-parser"
import { createIDBPersister } from "~/lib/persister.client"
import { urlComposer } from "~/lib/url-composer"

Network.setIpfsGateway(IPFS_GATEWAY)

const wagmiClient = createClient(getDefaultClientConfig({ appName: APP_NAME }))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const persister = createIDBPersister()

const colorScheme: NotificationModalColorScheme = {
  text: `rgb(var(--tw-colors-i-zinc-800))`,
  textSecondary: `rgb(var(--tw-colors-i-gray-600))`,
  background: `rgb(var(--tw-colors-i-white))`,
  border: `var(--border-color)`,
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)

  useDarkMode()
  useMobileLayout()

  return (
    <WagmiConfig client={wagmiClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              const queryIsReadyForPersistance =
                query.state.status === "success"
              if (queryIsReadyForPersistance) {
                return !((query.state?.data as any)?.pages?.length > 1)
              } else {
                return false
              }
            },
          },
        }}
      >
        <ConnectKitProvider
          ipfsLinkToHttpLink={toGateway}
          urlComposer={urlComposer}
          signInStrategy="simple"
          ignoreWalletDisconnectEvent={true}
        >
          <Hydrate state={pageProps.dehydratedState}>
            {/* <ReactQueryDevtools /> */}
            <NextNProgress
              options={{ easing: "linear", speed: 500, trickleSpeed: 100 }}
            />
            {getLayout(<Component {...pageProps} />)}
            <Toaster />
            <NotificationModal colorScheme={colorScheme} />
          </Hydrate>
        </ConnectKitProvider>
      </PersistQueryClientProvider>
    </WagmiConfig>
  )
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default appWithTranslation(MyApp)
