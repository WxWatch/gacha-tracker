import React from 'react'
import Box from '@mui/material/Box'
import Tabs, { TabsProps } from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { styled, alpha } from '@mui/material/styles'

interface Props {
  tabs: string[]
  value: number
  onChange?: TabsProps['onChange']
  disabled?: boolean
}

export default function GachaTabsAction (props: Props) {
  return (
    <Box display="inline-flex" alignItems="center">
      <Tabs value={props.value} onChange={props.onChange} disabled={props.disabled}
        sx={{
          minHeight: 0,
          borderRadius: 2,
          bgcolor: (theme) => theme.palette.action.hover
        }}
      >
        {props.tabs.map((label, i) => (
          <GachaTabsActionTab key={i} label={label} disabled={props.disabled} />
        ))}
      </Tabs>
    </Box>
  )
}

const GachaTabsActionTab = styled((props: { label: string, disabled?: boolean }) => (
  <Tab {...props} />
))(({ theme }) => ({
  minWidth: 0,
  minHeight: 0,
  height: 36,
  padding: theme.spacing(0, 2),
  '&:first-of-type': {
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2
  },
  '&:last-of-type': {
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2
  },
  '&.Mui-selected': {
    background: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity + 0.05)
  }
}))
