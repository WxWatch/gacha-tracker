import { useAllAccounts } from "@/hooks/useAccount";
import {
  Account,
  AccountFacet,
  resolveAccountDisplayName,
  resolveFacetName,
} from "@/interfaces/account";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";

export default function SettingAccounts() {
  const allAccounts = useAllAccounts();

  if (!allAccounts) {
    return "Error retrieving accounts";
  }

  const { accounts } = allAccounts;
  const sections = [];
  for (const [facet, account] of accounts) {
    sections.push(<AccountSection facet={facet} accounts={[account]} />);
  }

  return sections;
}

function AccountSection({
  facet,
  accounts,
}: {
  facet: AccountFacet;
  accounts: Account[];
}) {
  return (
    <Box>
      <Typography variant="body1">{resolveFacetName(facet)}</Typography>
      {accounts.map((account) => (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>UID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{resolveAccountDisplayName(account)}</TableCell>
                <TableCell>{account.uid}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ))}
    </Box>
  );
}
