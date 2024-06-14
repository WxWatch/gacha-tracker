import React from "react";
import Layout from "@/components/Layout";
import SettingAbout from "@/components/setting/SettingAbout";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import SettingAccounts from "@/components/setting/SettingAccounts";

const Sections = [
  { id: "settings", title: "Settings", content: <></> },
  { id: "accounts", title: "Accounts", content: <SettingAccounts /> },
  { id: "about", title: "About", content: <SettingAbout /> },
];

export default function Setting() {
  return (
    <Layout>
      {Sections.map((section) => (
        <section key={section.id} id={section.id}>
          <Typography component="h2" variant="h6">
            {section.title}
          </Typography>
          <Divider sx={{ marginY: 2 }} />
          {section.content}
        </section>
      ))}
    </Layout>
  );
}
