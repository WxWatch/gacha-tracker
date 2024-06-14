import React from "react";
import { useImmer } from "use-immer";
import { AccountFacet, resolveCurrency } from "@/interfaces/account";
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
import PluginGacha from "@/utilities/plugin-gacha";
import {
  KnownWutheringWavesGachaTypes,
  NamedKuroRecords,
} from "@/hooks/useKuroRecordsQuery";
import {
  KnownGenshinGachaTypes,
  KnownStarRailGachaTypes,
  NamedMihoyoRecords,
} from "@/hooks/useMihoyoRecordsQuery";
import { GachaCategory } from "@/hooks/constants";

export default function GachaActionUpdate() {
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

  const getTheStuff = (
    facet: AccountFacet,
    namedValues:
      | Record<GachaCategory, NamedKuroRecords>
      | Record<GachaCategory, NamedMihoyoRecords>
  ): Record<string, string | null> => {
    let gachaTypes = null;
    switch (facet) {
      case AccountFacet.Genshin:
        gachaTypes = KnownGenshinGachaTypes;
        break;
      case AccountFacet.StarRail:
        gachaTypes = KnownStarRailGachaTypes;
        break;
      case AccountFacet.WutheringWaves:
        gachaTypes = KnownWutheringWavesGachaTypes;
    }
    return Object.entries(gachaTypes).reduce(
      (mappings, [gachaType, category]) => {
        switch (facet) {
          case AccountFacet.Genshin:
          case AccountFacet.StarRail:
            mappings[gachaType] = namedValues[category].lastEndId || null;
            break;
          case AccountFacet.WutheringWaves:
            mappings[gachaType] = namedValues[category].lastTime || null;
            break;
        }

        return mappings;
      },
      {} as Record<string, string | null>
    );
  };

  const handleUpdate = React.useCallback(async () => {
    produceState((draft) => {
      draft.busy = true;
    });

    const { facet, uid, gameDataDir, gachaUrl } = selectedAccount;
    let newGachaUrl = null;
    try {
      newGachaUrl = await PluginGacha.findGachaUrl(facet, uid, gameDataDir);
      // const newGachaUrl =
      //   "https://webstatic-sea.hoyoverse.com/genshin/event/e20190909gacha-v2/index.html?win_mode=fullscreen&authkey_ver=1&sign_type=2&auth_appid=webview_gacha&init_type=301&gacha_id=89755dc7cbe9a8c2a6c48fc0f2c3992e9b2d590e&timestamp=1684884838&lang=en&device_type=pc&game_version=OSRELWin3.7.0_R14937036_S14962190_D15063751&plat_type=pc&region=os_usa&authkey=yyWiX7aE4nqim1sWgBG9%2f0R9n7aeFIYChfqdOs3jxRnPb%2bKj%2bCpYFf%2bxucXKTEr%2bW%2b8m44KHSvaeUWKUf4DuG0bqNy%2baj5wTfQEjwwlQwjCyeb2Ox30XxcoS9NbKPgDloqyqVpZfCrUM%2bbEPNSNljSzUCSiT6ZCSfRfLmXaBtPMk%2baBj6JTIvVd9HZXDDOoIIDjM0ebuZAk1dMflhLiewcxM0%2f2%2fYoYb5XdV6ajoUrWjvOo96UIJW2sO%2bj6jsDIN4H2wERQUrN3Y0Vkn8pF98OHxdhR4Whxs%2b1%2fhbp0upqIuk1cn9XQCylgVPAX9tguYarFYbHDf1B8w2IQKDeuPh38y%2fG3EOkXq783BttMrR3hudyXcdU0lgNZ1dRJdB4udvyfGfPBuKGn%2bShGjLECKhJ0ClDZMR8ir41ezyChpt5whbuXcMoG%2bc87yYbe3nzaYkkGo1HyopZ4S9IHkldekf%2fLRozTuKs9AZeBsjXybp6nfTJse6O6qiKbu%2f3rCxsEBcJNJTldzdmtGvNLefnZDmpOsobm%2bANPuukkRzumNzeOBTfOt9Qvn2zLuRSwHPeMCZ49pNiGGCw4fm%2f2m%2bbuyMb%2fFEh5J3qOogccADoJP0r4DWOdUBa891R39rCHAvFVCZp4dJbl7TY4ro2LnPDvbgMc5wm3yTkdjcqgB2MjxjsE9%2bdMi%2bHTdHzMeoTUWMKvpT1WXVE7523yWcFcdfuqouEEzrL4dAllaC%2b4EmEEhcATXSESghD5fHUROCVNnZ6fivfdkNuXFJmvFf7hzprF0AUOggGPH55KR3Lua2AaoCMQbbx4fEKINzVIz4mvN67%2b3UA1kjnjT92I4a1s7LfhgxLnG%2fWGX8s6PtIUSiSdfxcKQb2kvolQVv%2b1WlAfT1XhNvYZ%2fPtgPz2mvoFDkSe%2f54fBWGTTo6sAhMWueyw8Br2mcxuG5Z7vAgF%2baqsGYvS9DZ2%2brQqiR6SjEgKEdOV6EGmKhXsUJUQCGnL6MuTu6CX%2f1Gd%2fXHtQZ6Ew5fMm6h%2bTGEf%2fpNnK%2bpHSMDWUyWxwHZNRk1HdnYueE5MebSi2biSdCLa7F3b3pSCKutguPm7QVkQO2Wb1Rmk44wuMSzJMpoXymqRQT5lNJ8ski4OAKZj3WdG1NFZnAk27ORXk43IALUVeX3Ijw5%2b3aRt0uaLudH8ZJ1pBLAb4ODmtG1N%2b7eoe9TNzwKZrgyBd8Cn5dZ7YBxf2uxABJmYS9Cbs2w0sBAmQH0RpVx6qpdyGj47RGiXJoAN2ObgYGMhFAMmWDx8Q9QIQpEDFnnoJ1cXBb2mzedJEyMb5w6UvvVKIJCsTKtNJUOEyWxQIsbhsrIq8z4%2bLNa4%2fL6b%2bUog95z6kMFYxiyg%3d%3d&game_biz=";
      if (newGachaUrl !== gachaUrl) {
        // Update gacha url only if it's changed
        await updateAccountGachaUrl(facet, uid, newGachaUrl);
      }
      alert(null, "Read the link successfully!");
    } catch (e) {
      alert(e);
    } finally {
      produceState((draft) => {
        draft.busy = false;
      });
    }

    if (!newGachaUrl) {
      // alert("Link not available! Please try to read the link first.");
      return;
    }

    produceState((draft) => {
      draft.busy = true;
    });
    try {
      const { namedValues } = gachaRecords;
      await pull(facet, uid, {
        gachaUrl: newGachaUrl,
        gachaTypeAndLastQueryMappings: getTheStuff(facet, namedValues),
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
      console.log("gachaRecords", gachaRecords, category);
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
          onClick={handleUpdate}
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
