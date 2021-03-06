import * as React from 'react';

import { DetailsPage, List, ListPage, WorkloadListHeader, WorkloadListRow } from './factory';
import {Cog, navFactory, SectionHeading, ResourceSummary, AsyncComponent} from './utils';
import { ResourceEventStream } from './events';

const menuActions = [Cog.factory.EditEnvironment, ...Cog.factory.common];

const kind = 'StatefulSet';
const Row = props => <WorkloadListRow {...props} kind={kind} actions={menuActions} />;

const Details = ({obj: ss}) => <React.Fragment>
  <div className="co-m-pane__body">
    <SectionHeading text="StatefulSet Overview" />
    <ResourceSummary resource={ss} showNodeSelector={false} />
  </div>
</React.Fragment>;

const EnvironmentPage = (props) => <AsyncComponent loader={() => import('./environment.jsx').then(c => c.EnvironmentPage)} {...props} />;

const envPath = ['spec','template','spec','containers'];
const environmentComponent = (props) => <EnvironmentPage
  obj={props.obj}
  rawEnvData={props.obj.spec.template.spec.containers}
  envPath={envPath}
  readOnly={false}
/>;

export const StatefulSetsList = props => <List {...props} Header={WorkloadListHeader} Row={Row} />;
export const StatefulSetsPage = props => <ListPage {...props} ListComponent={StatefulSetsList} kind={kind} canCreate={true} />;

const pages = [
  navFactory.details(Details),
  navFactory.editYaml(),
  navFactory.pods(),
  navFactory.envEditor(environmentComponent),
  navFactory.events(ResourceEventStream)
];

export const StatefulSetsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={pages}
/>;
