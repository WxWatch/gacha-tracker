import { Account, AccountFacet } from "@/interfaces/account";
import PluginStorage, { AccountUid } from "@/utilities/plugin-storage";
import { FetchQueryOptions, QueryKey, useQuery } from "@tanstack/react-query";

/// Local Storage
const SelectedAccountUidKey = "selectedAccountUid";
const LocalStorageSelectedAccountUid = Object.freeze({
  get(facet: AccountFacet) {
    return localStorage.getItem(
      `${FacetedQueryPrefix}:${facet}:${SelectedAccountUidKey}`
    );
  },
  set(facet: AccountFacet, uid: AccountUid) {
    localStorage.setItem(
      `${FacetedQueryPrefix}:${facet}:${SelectedAccountUidKey}`,
      uid
    );
  },
  remove(facet: AccountFacet) {
    localStorage.removeItem(
      `${FacetedQueryPrefix}:${facet}:${SelectedAccountUidKey}`
    );
  },
});

/// Faceted Accounts
const FacetedQueryPrefix = "facetedAccounts";

export interface FacetedAccounts {
  readonly facet: AccountFacet;
  readonly accounts: Map<AccountUid, Account>;
  readonly selectedAccountUid: AccountUid | null;
}

export const useFacetedAccounts = (
  facet: AccountFacet
): FacetedAccounts | undefined => {
  const query = createFacetedQuery(facet);
  const response = useQuery({
    ...query,
    refetchOnWindowFocus: false,
  });

  return response.data;
};

const facetedAccountQueryFn: FetchQueryOptions<FacetedAccounts>["queryFn"] =
  async (context) => {
    const [, facet] = context.queryKey as [string, AccountFacet];
    const accounts = (await PluginStorage.findAccounts(facet)).reduce(
      (acc, account) => {
        acc.set(account.uid, account);
        return acc;
      },
      new Map() as FacetedAccounts["accounts"]
    );

    let selectedAccountUid = LocalStorageSelectedAccountUid.get(facet);
    if (selectedAccountUid && !accounts.get(selectedAccountUid)) {
      console.warn(
        `LocalStorage contains invalid ${SelectedAccountUidKey} ${selectedAccountUid} for ${facet} facet.`
      );
      LocalStorageSelectedAccountUid.remove(facet as AccountFacet);

      // HACK: Auto-select first valid account
      selectedAccountUid = Object.keys(accounts)[0] ?? null;
      if (selectedAccountUid) {
        console.warn(
          `Auto-selecting first account ${selectedAccountUid} for ${facet} facet.`
        );
        LocalStorageSelectedAccountUid.set(facet, selectedAccountUid);
      }
    }

    return {
      facet,
      accounts,
      selectedAccountUid,
    } as FacetedAccounts;
  };

function createFacetedQuery(
  facet: AccountFacet
): FetchQueryOptions<FacetedAccounts> & { queryKey: QueryKey } {
  return {
    queryKey: [FacetedQueryPrefix, facet],
    queryFn: facetedAccountQueryFn,
    staleTime: Infinity,
  };
}

/// All Accounts
const AccountsQueryPrefix = "facetedAccounts";

export interface AllAccounts {
  readonly accounts: Map<AccountFacet, Account>;
}

const allAccountsQueryFn: FetchQueryOptions<AllAccounts>["queryFn"] =
  async () => {
    const accounts = (await PluginStorage.findAccounts()).reduce(
      (acc, account) => {
        acc.set(account.facet, account);
        return acc;
      },
      new Map() as AllAccounts["accounts"]
    );

    return {
      accounts,
    } as AllAccounts;
  };

function createAllQuery(): FetchQueryOptions<AllAccounts> & {
  queryKey: QueryKey;
} {
  return {
    queryKey: [AccountsQueryPrefix],
    queryFn: allAccountsQueryFn,
    staleTime: Infinity,
  };
}

export const useAllAccounts = (): AllAccounts | undefined => {
  const query = createAllQuery();
  const response = useQuery({
    ...query,
    refetchOnWindowFocus: false,
  });

  return response.data;
};
