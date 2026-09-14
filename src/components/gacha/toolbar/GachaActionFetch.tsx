import React from "react";
import { useImmer } from "use-immer";
import { resolveCurrency } from "@/interfaces/account";
import {
  useUpdateAccountGachaUrlFn,
  useUpdateAccountPropertiesFn,
} from "@/hooks/useStatefulAccount";
import {
  GachaRecords,
  useRefetchGachaRecordsFn,
} from "@/hooks/useGachaRecordsQuery";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import useGachaRecordsFetcher from "@/hooks/useGachaRecordsFetcher";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CachedIcon from "@mui/icons-material/Cached";
import { borderRadius, spacing } from "@/theme/tokens";

// TODO: remove this
export default function GachaActionFetch() {
  const { facet, selectedAccount, gachaRecords, alert } =
    useGachaLayoutContext();
  const { currentFragment, pull } = useGachaRecordsFetcher();
  const { action } = resolveCurrency(selectedAccount.facet);
  const updateAccountGachaUrl = useUpdateAccountGachaUrlFn();
  const updateAccountProperties = useUpdateAccountPropertiesFn();
  const refetchGachaRecords = useRefetchGachaRecordsFn(facet);
  const [{ busy }, produceState] = useImmer({
    busy: false,
  });

  const [currentCategory, setCurrentCategory] = React.useState("");
  const [currentTotal, setCurrentTotal] = React.useState(0);

  const handleFetch = React.useCallback(async () => {
    if (!selectedAccount.gachaUrl) {
      alert("Link not available! Please try to read the link first.");
      return;
    }

    produceState((draft) => {
      draft.busy = true;
    });

    const { facet, uid, gachaUrl } = selectedAccount;
    try {
      const {
        namedValues: { character, weapon, permanent, beginner },
      } = gachaRecords;
      await pull(facet, uid, {
        gachaUrl,
        gachaTypeAndLastQueryMappings: {
          [character.gachaType]: character.lastEndId ?? null,
          [weapon.gachaType]: weapon.lastEndId ?? null,
          [permanent.gachaType]: permanent.lastEndId ?? null,
          [beginner.gachaType]: beginner.lastEndId ?? null,
        },
        eventChannel: "gachaRecords-fetcher-event-channel",
        saveToStorage: true,
      });
      await updateAccountProperties(facet, uid, {
        ...selectedAccount.properties,
        lastGachaUpdated: new Date().toISOString(),
      });
      await refetchGachaRecords(facet, uid);
      alert(null, "Record updated successfully!");
    } catch (e) {
      // TODO: optimize error handling
      const isTimeoutdGachaUrlError =
        e && (e instanceof Error || typeof e === "object")
          ? "identifier" in e && e.identifier === "TIMEOUTD_GACHA_URL"
          : false;

      if (isTimeoutdGachaUrlError) {
        await updateAccountGachaUrl(facet, uid, null);
      }
      alert(e);
    } finally {
      produceState((draft) => {
        draft.busy = false;
      });
    }
  }, [
    selectedAccount,
    gachaRecords,
    alert,
    pull,
    updateAccountGachaUrl,
    updateAccountProperties,
    refetchGachaRecords,
    produceState,
  ]);

  React.useEffect(() => {
    if (
      currentFragment === "idle" ||
      currentFragment === "sleeping" ||
      currentFragment === "finished"
    ) {
      resetFetchState();
    } else if ("ready" in currentFragment) {
      const gachaType = currentFragment.ready;
      const category = gachaRecords.gachaTypeToCategoryMappings[gachaType];
      const categoryTitle = gachaRecords.namedValues[category].categoryTitle;
      setCurrentCategory(categoryTitle);
    } else if ("pagination" in currentFragment) {
      // const pagination = currentFragment.pagination;
    } else if ("data" in currentFragment) {
      const data = currentFragment.data;
      setCurrentTotal(currentTotal + data.length);
    } else {
      // Should never reach here
      resetFetchState();
    }
  }, [gachaRecords, currentFragment]);

  React.useEffect(() => {
    setCurrentTotal(0);
  }, [currentCategory]);

  const resetFetchState = () => {
    setCurrentCategory("");
  };

  const loadingString = () => {
    return (
      <>
        <p>{currentCategory}</p>
        <p>Located {currentTotal} new records</p>
      </>
    );
  };

  const stringifyFragment = (
    gachaRecords: GachaRecords,
    fragment: ReturnType<typeof useGachaRecordsFetcher>["currentFragment"]
  ) => {
    if (fragment === "idle") {
      return "idle...";
    } else if (fragment === "sleeping") {
      return "Waiting...";
    } else if (fragment === "finished") {
      return "Finish";
    } else if ("ready" in fragment) {
      return loadingString();
    } else if ("pagination" in fragment) {
      return loadingString();
    } else if ("data" in fragment) {
      return loadingString();
    } else {
      // Should never reach here
      return `Unknown fragment: ${JSON.stringify(fragment)}`;
    }
  };

  return (
    <Box display="inline-flex">
      <Button
        variant="outlined"
        color="primary"
        size="small"
        startIcon={<CachedIcon />}
        onClick={handleFetch}
        disabled={busy}
        sx={{
          borderRadius: `${borderRadius.md}px`,
          textTransform: "none",
          fontWeight: 600,
          px: `${spacing.md}px`,
        }}
      >
        {`Update ${action.plural}`}
      </Button>
      {busy && (
        <Backdrop
          open={busy}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            color: "#fff",
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: `${borderRadius.xl}px`,
              p: `${spacing.xl}px`,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              minWidth: 320,
            }}
          >
            <CircularProgress
              size={56}
              thickness={4}
              sx={{ color: "primary.light" }}
            />
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ mt: `${spacing.lg}px`, color: "#fff" }}
            >
              {`Retrieving latest ${action.plural.toLowerCase()}...`}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: `${spacing.sm}px`,
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              {stringifyFragment(gachaRecords, currentFragment)}
            </Typography>
          </Box>
        </Backdrop>
      )}
    </Box>
  );
}
