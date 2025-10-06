"use client";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function MarketplaceSearchBar() {
  const pathname = usePathname();
  
  const isDashboard = pathname === "/dashboard";
  const isInvestment = pathname === "/investment";
  const isFaucet = pathname === "/faucet";
  const isMarketplace = pathname === "/marketplace";

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-beige border-none">
      {/* Logo */}
      <div className="ml-5 flex items-center gap-4 mr-0 pr-0">
        <img
          src="/logo-landzen.png"
          onClick={() => (window.location.href = "/")}
          alt="Logo"
          className="h-12 w-13 cursor-pointer border-none"
        />
        <a onClick={() => (window.location.href = "/")} className="pl-0 mr-0 text-green font-bold px-2.5 text-2xl hover:cursor-pointer">Terrum</a>
      </div>

      {/* Navigation + Wallet */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className={`text-green font-semibold px-2.5 transition-all duration-200 ${
            isDashboard
              ? "border-b-2 border-green pb-1"
              : "hover:border-b-2 hover:border-green hover:pb-1"
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => {
            window.location.href = "/investment";
          }}
          className={`text-green font-semibold px-2.5 transition-all duration-200 ${
            isInvestment
              ? "border-b-2 border-green pb-1"
              : "hover:border-b-2 hover:border-green hover:pb-1"
          }`}
        >
          Investment
        </button>

        <button
          onClick={() => {
            window.location.href = "/marketplace";
          }}
          className={`text-green font-semibold px-2.5 transition-all duration-200 ${
            isMarketplace
              ? "border-b-2 border-green pb-1"
              : "hover:border-b-2 hover:border-green hover:pb-1"
          }`}
        >
          Marketplace
        </button>

        <button
          onClick={() => {
            window.location.href = "/faucet";
          }}
          className={`text-green font-semibold px-2.5 transition-all duration-200 ${
            isFaucet
              ? "border-b-2 border-green pb-1"
              : "hover:border-b-2 hover:border-green hover:pb-1"
          }`}
        >
          Faucet
        </button>

        {/* RainbowKit Connect Button */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            // Note: If your app doesn't use authentication, you
            // can remove all 'authenticationStatus' checks
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="bg-moss-500 hover:bg-moss-600 text-white rounded-3xl px-4 py-2 text-sm font-semibold transition-colors"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="bg-red-500 hover:bg-red-600 text-white rounded-3xl px-4 py-2 text-sm font-semibold transition-colors"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="flex items-center gap-2 bg-moss-100 hover:bg-moss-200 text-moss-800 rounded-3xl px-3 py-2 text-sm font-semibold transition-colors text-black"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 16,
                              height: 16,
                              borderRadius: 999,
                              overflow: 'hidden',
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 16, height: 16 }}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>

                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="bg-moss-500 hover:bg-moss-600 text-white rounded-3xl px-4 py-2 text-sm font-semibold transition-colors"
                      >
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </nav>
  );
}
