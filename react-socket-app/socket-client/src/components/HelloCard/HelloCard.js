import React from "react";
import {
  Card,
  CardActions,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
} from "@material-ui/core";

export default ({ theme, toggleDarkTheme }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h3">Hello CodeSandbox</Typography>
        <Typography color="textSecondary">
          Cliquer sur le switch pour changer la couleur du theme
        </Typography>
      </CardContent>
      <CardActions>
        <FormControlLabel
          control={
            <Switch
              onChange={toggleDarkTheme}
              checked={theme.palette.type === "dark"}
              color="primary"
            />
          }
          label={`Thème ${theme.palette.type === "light" ? "clair" : "sombre"}`}
        />
      </CardActions>
    </Card>
  );
};
