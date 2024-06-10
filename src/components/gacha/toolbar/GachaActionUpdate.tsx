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
import ButtonGroup from "@mui/material/ButtonGroup";
import { ArrowDropDown, DeleteOutline } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import GachaMenuItemImport from "./GachaMenuItemImport";
import GachaMenuItemExport from "./GachaMenuItemExport";

export default function GachaActionUpdate() {
  const { selectedAccount, gachaRecords, alert } = useGachaLayoutContext();
  const { currentFragment, pull } = useGachaRecordsFetcher();
  const { action } = resolveCurrency(selectedAccount.facet);
  const updateAccountGachaUrl = useUpdateAccountGachaUrlFn();
  const updateAccountProperties = useUpdateAccountPropertiesFn();
  const refetchGachaRecords = useRefetchGachaRecordsFn();
  const [{ busy }, produceState] = useImmer({
    busy: false,
  });

  const anchorRef = React.useRef<HTMLDivElement>(null);

  const [currentCategory, setCurrentCategory] = React.useState("");
  const [currentTotal, setCurrentTotal] = React.useState(0);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleMenuToggle = () => {
    console.log("tawglgle", !menuOpen);
    setMenuOpen((prevOpen) => !prevOpen);
  };

  const handleMenuClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setMenuOpen(false);
  };

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
        gachaTypeAndLastEndIdMappings: {
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
      const pagination = currentFragment.pagination;
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
      <ButtonGroup variant="contained" ref={anchorRef}>
        <Button
          color="primary"
          size="small"
          startIcon={<CachedIcon />}
          onClick={handleFetch}
          disabled={busy}
        >
          {`Update`}
        </Button>
        <Button size="small" onClick={handleMenuToggle}>
          <ArrowDropDown />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={menuOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleMenuClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  <GachaMenuItemImport />
                  <GachaMenuItemExport />
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      {busy && (
        <Backdrop
          open={busy}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: "rgba(0, 0, 0, 0.75)",
            color: "#efefef",
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Paper>
              <Box display="flex" flexDirection="column" alignItems="center">
                {/* TODO: custom loading GIFs */}
                <CircularProgress color="info" />
                <Typography variant="h6" sx={{ marginTop: 2 }}>
                  {`Retrieving latest ${action.plural.toLocaleLowerCase()}...`}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ marginTop: 1, textAlign: "center" }}
                >
                  {stringifyFragment(gachaRecords, currentFragment)}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Backdrop>
      )}
    </Box>
  );
}
