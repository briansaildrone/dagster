import * as React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';

import {useFeatureFlags} from '../app/Flags';
import {AutomaterializationRoot} from '../assets/auto-materialization/AutomaterializationRoot';
import {InstanceBackfills} from '../instance/InstanceBackfills';
import {BackfillPage} from '../instance/backfill/BackfillPage';

import {OverviewActivityRoot} from './OverviewActivityRoot';
import {OverviewJobsRoot} from './OverviewJobsRoot';
import {OverviewResourcesRoot} from './OverviewResourcesRoot';
import {OverviewSchedulesRoot} from './OverviewSchedulesRoot';
import {OverviewSensorsRoot} from './OverviewSensorsRoot';

export const OverviewRoot = () => {
  const {flagEnableAMPTimeline} = useFeatureFlags();
  return (
    <Switch>
      <Route path="/overview/activity">
        <OverviewActivityRoot />
      </Route>
      <Route path="/overview/jobs">
        <OverviewJobsRoot />
      </Route>
      <Route path="/overview/schedules">
        <OverviewSchedulesRoot />
      </Route>
      <Route path="/overview/sensors">
        <OverviewSensorsRoot />
      </Route>
      {flagEnableAMPTimeline ? (
        <Route path="/overview/amp">
          <AutomaterializationRoot />
        </Route>
      ) : null}
      <Route path="/overview/backfills/:backfillId">
        <BackfillPage />
      </Route>
      <Route path="/overview/backfills" exact>
        <InstanceBackfills />
      </Route>
      <Route path="/overview/resources">
        <OverviewResourcesRoot />
      </Route>
      <Route path="*" render={() => <Redirect to="/overview/activity" />} />
    </Switch>
  );
};

// Imported via React.lazy, which requires a default export.
// eslint-disable-next-line import/no-default-export
export default OverviewRoot;
