import * as React from 'react';
import * as _ from 'lodash-es';
import {
  headerCol,
  sortable,
  Visibility,
  classNames,
} from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { DeploymentModel } from '../models';
import { configureUpdateStrategyModal, errorModal } from './modals';
import { Conditions } from './conditions';
import { ResourceEventStream } from './events';
import { formatDuration } from './utils/datetime';
import { VolumesTable } from './volumes-table';
import {
  DetailsPage,
  ListPage,
  List,
  WorkloadListHeader,
  WorkloadListRow,
  Table,
} from './factory';
import {
  AsyncComponent,
  Kebab,
  ContainerTable,
  DeploymentPodCounts,
  navFactory,
  pluralize,
  ResourceSummary,
  SectionHeading,
  StatusIcon,
  togglePaused,
  WorkloadPausedAlert,
  LabelList,
  ResourceKebab,
  ResourceLink,
  resourcePath,
  Selector,
} from './utils';

const {ModifyCount, AddStorage, EditEnvironment, common} = Kebab.factory;

const UpdateStrategy = (kind, deployment) => ({
  label: 'Edit Update Strategy',
  callback: () => configureUpdateStrategyModal({deployment}),
});

export const pauseAction = (kind, obj) => ({
  label: obj.spec.paused ? 'Resume Rollouts' : 'Pause Rollouts',
  callback: () => togglePaused(kind, obj).catch((err) => errorModal({error: err.message})),
});

export const menuActions = [
  ModifyCount,
  pauseAction,
  AddStorage,
  UpdateStrategy,
  EditEnvironment,
  ...common,
];

export const DeploymentDetailsList = ({deployment}) => {
  const isRecreate = (deployment.spec.strategy.type === 'Recreate');
  const progressDeadlineSeconds = _.get(deployment, 'spec.progressDeadlineSeconds');
  return <dl className="co-m-pane__details">
    <dt>Update Strategy</dt>
    <dd>{deployment.spec.strategy.type || 'RollingUpdate'}</dd>
    {isRecreate || <dt>Max Unavailable</dt>}
    {isRecreate || <dd>{deployment.spec.strategy.rollingUpdate.maxUnavailable || 1} of {pluralize(deployment.spec.replicas, 'pod')}</dd>}
    {isRecreate || <dt>Max Surge</dt>}
    {isRecreate || <dd>{deployment.spec.strategy.rollingUpdate.maxSurge || 1} greater than {pluralize(deployment.spec.replicas, 'pod')}</dd>}
    {progressDeadlineSeconds && <dt>Progress Deadline</dt>}
    {progressDeadlineSeconds && <dd>{/* Convert to ms for formatDuration */ formatDuration(progressDeadlineSeconds * 1000)}</dd>}
    <dt>Min Ready Seconds</dt>
    <dd>{deployment.spec.minReadySeconds ? pluralize(deployment.spec.minReadySeconds, 'second') : 'Not Configured'}</dd>
  </dl>;
};

const DeploymentDetails = ({obj: deployment}) => {
  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text="Deployment Overview" />
      {deployment.spec.paused && <WorkloadPausedAlert obj={deployment} model={DeploymentModel} />}
      <DeploymentPodCounts resource={deployment} resourceKind={DeploymentModel} />
      <div className="co-m-pane__body-group">
        <div className="row">
          <div className="col-sm-6">
            <ResourceSummary resource={deployment} showPodSelector showNodeSelector showTolerations>
              <dt>Status</dt>
              <dd>{deployment.status.availableReplicas === deployment.status.updatedReplicas ? <StatusIcon status="Active" /> : <StatusIcon status="Updating" />}</dd>
            </ResourceSummary>
          </div>
          <div className="col-sm-6">
            <DeploymentDetailsList deployment={deployment} />
          </div>
        </div>
      </div>
    </div>
    <div className="co-m-pane__body">
      <SectionHeading text="Containers" />
      <ContainerTable containers={deployment.spec.template.spec.containers} />
    </div>
    <div className="co-m-pane__body">
      <VolumesTable podTemplate={deployment.spec.template} heading="Volumes" />
    </div>
    <div className="co-m-pane__body">
      <SectionHeading text="Conditions" />
      <Conditions conditions={deployment.status.conditions} />
    </div>
  </React.Fragment>;
};
const EnvironmentPage = (props) => <AsyncComponent loader={() => import('./environment.jsx').then(c => c.EnvironmentPage)} {...props} />;

const envPath = ['spec','template','spec','containers'];
const environmentComponent = (props) => <EnvironmentPage
  obj={props.obj}
  rawEnvData={props.obj.spec.template.spec}
  envPath={envPath}
  readOnly={false}
/>;

const {details, editYaml, pods, envEditor, events} = navFactory;
const DeploymentsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[details(DeploymentDetails), editYaml(), pods(), envEditor(environmentComponent), events(ResourceEventStream)]}
/>;

const Row = props => <WorkloadListRow {...props} kind="Deployment" actions={menuActions} />;

const kind = 'Deployment';

const DeploymentTableRow = (o) => {
  return {
    id: o.metadata.uid,
    cells: [
      {
        title: <ResourceLink kind={kind} name={o.metadata.name} namespace={o.metadata.namespace} title={o.metadata.uid} />,
      },
      {
        title: <ResourceLink kind="Namespace" name={o.metadata.namespace} title={o.metadata.namespace} />,
      },
      {
        title: <LabelList kind={kind} labels={o.metadata.labels} />,
      },
      {
        title: <Link to={`${resourcePath(kind, o.metadata.name, o.metadata.namespace)}/pods`} title="pods">
          {o.status.replicas || 0} of {o.spec.replicas} pods
        </Link>,
      },
      {
        title: <Selector selector={o.spec.selector} namespace={o.metadata.namespace} />,
      },
      {
        title: <ResourceKebab actions={menuActions} kind={kind} resource={o} />,
        props: { className: 'pf-c-table__action'},
      },
    ],
  };
};

const DeploymentTableRows = componentProps =>
  _.map(componentProps.data, obj => obj && obj.metadata && DeploymentTableRow(obj));

const DeploymentTableHeader = props => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      columnTransforms: [classNames('pf-u-w-25-on-lg', 'pf-u-w-25-on-md', 'pf-u-w-33-on-sm', 'pf-u-w-50-on-xs')],
      cellTransforms: [headerCol()], props,
    },
    {
      title: 'Namespace', sortField: 'metadata.namespace', transforms: [sortable],
      columnTransforms: [classNames('pf-u-w-25-on-lg', 'pf-u-w-25-on-md', 'pf-u-w-33-on-sm', 'pf-u-w-50-on-xs')],
      props,
    },
    {
      title: 'Labels', sortField: 'metadata.labels', transforms: [sortable],
      columnTransforms: [classNames('pf-u-w-33-on-lg', 'pf-u-w-33-on-md', 'pf-u-w-33-on-sm', Visibility.hidden, Visibility.visibleOnMd)],
      props,
    },
    {
      title: 'Status', sortFunc: 'numReplicas', transforms: [sortable],
      columnTransforms: [classNames('pf-u-w-25-on-lg', 'pf-u-w-25-on-md', Visibility.hidden, Visibility.visibleOnLg)],
      props: {...props, className: 'meta-status'},
    },
    { title: 'Pod Selector', sortField: 'spec.selector', transforms: [sortable],
      columnTransforms: [classNames('pf-u-w-25-on-lg', Visibility.hidden, Visibility.visibleOnXl)], props },
    // todo: add support for table actions api: https://github.com/patternfly/patternfly-react/pull/1441
    // this is for the empty actions/kebab column header
    { title: '' },
  ];
};

const DeploymentsList = props => <React.Fragment>
  <Table {...props} aria-label="Deployments" Header={DeploymentTableHeader} Rows={DeploymentTableRows} virtualize />
  {/* existing list for comparison purposes only */}
  {false && <List {...props} Header={WorkloadListHeader} Row={Row} />}
</React.Fragment>;

const DeploymentsPage = props => <ListPage canCreate={true} ListComponent={DeploymentsList} {...props} />;

export {DeploymentsList, DeploymentsPage, DeploymentsDetailsPage};
