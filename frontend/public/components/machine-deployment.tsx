import * as React from 'react';
import * as _ from 'lodash-es';
import { Link } from 'react-router-dom';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import { MachineModel, MachineDeploymentModel } from '../models';
import { MachineDeploymentKind, referenceForModel } from '../module/k8s';
import { getMachineRole } from './machine';
import {
  editCountAction,
  getAWSPlacement,
  getDesiredReplicas,
  getReadyReplicas,
  MachineCounts,
  MachineTabPage,
} from './machine-set';
import { ColHead, DetailsPage, List, ListHeader, ListPage, Table, Vr, Vd } from './factory';
import {
  Kebab,
  ResourceKebab,
  ResourceLink,
  ResourceSummary,
  SectionHeading,
  Selector,
  navFactory,
  pluralize,
  resourcePath,
} from './utils';
import { formatDuration } from './utils/datetime';

const { common } = Kebab.factory;
const menuActions = [editCountAction, ...common];
const machineReference = referenceForModel(MachineModel);
const machineDeploymentReference = referenceForModel(MachineDeploymentModel);

const tableColumnClasses = [
  classNames('pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-4-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  Kebab.columnClass,
];

const MachineDeploymentHeader: React.SFC = props => <ListHeader>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.namespace">Namespace</ColHead>
  <ColHead {...props} className="col-sm-4 hidden-xs" sortField="status.replicas">Machines</ColHead>
</ListHeader>;

export const MachineDeploymentTableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'Namespace', sortField: 'metadata.namespace', transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Machines', sortField: 'status.replicas', transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: '', props: { className: tableColumnClasses[3] },
    },
  ];
};
MachineDeploymentTableHeader.displayName = 'MachineDeploymentTableHeader';

const MachineDeploymentRow: React.SFC<MachineDeploymentRowProps> = ({obj}: {obj: MachineDeploymentKind}) => <div className="row co-resource-list__item">
  <div className="col-sm-4 col-xs-6">
    <ResourceLink kind={machineDeploymentReference} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
  </div>
  <div className="col-sm-4 col-xs-6 co-break-word">
    <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
  </div>
  <div className="col-sm-4 hidden-xs">
    <Link to={`${resourcePath(machineDeploymentReference, obj.metadata.name, obj.metadata.namespace)}/machines`}>
      {getReadyReplicas(obj)} of {getDesiredReplicas(obj)} machines
    </Link>
  </div>
  <div className="dropdown-kebab-pf">
    <ResourceKebab actions={menuActions} kind={machineDeploymentReference} resource={obj} />
  </div>
</div>;

export const MachineDeploymentTableRow: React.FC<MachineDeploymentTableRowProps> = ({obj, index, key, style}) => {
  return (
    <Vr id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind={machineDeploymentReference} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </Vd>
      <Vd className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        <Link to={`${resourcePath(machineDeploymentReference, obj.metadata.name, obj.metadata.namespace)}/machines`}>
          {getReadyReplicas(obj)} of {getDesiredReplicas(obj)} machines
        </Link>
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        <ResourceKebab actions={menuActions} kind={machineDeploymentReference} resource={obj} />
      </Vd>
    </Vr>
  );
};
MachineDeploymentTableRow.displayName = 'MachineDeploymentTableRow';
export type MachineDeploymentTableRowProps = {
  obj: MachineDeploymentKind;
  index: number;
  key?: string;
  style: object;
};

const MachineDeploymentDetails: React.SFC<MachineDeploymentDetailsProps> = ({obj}) => {
  const machineRole = getMachineRole(obj);
  const { availabilityZone, region } = getAWSPlacement(obj);
  const { minReadySeconds, progressDeadlineSeconds } = obj.spec;
  const rollingUpdateStrategy = _.get(obj, 'spec.strategy.rollingUpdate');
  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text="Machine Deployment Overview" />
      <MachineCounts resourceKind={MachineDeploymentModel} resource={obj} />
      <div className="row">
        <div className="col-sm-6">
          <ResourceSummary resource={obj}>
            <dt>Selector</dt>
            <dd>
              <Selector
                kind={machineReference}
                selector={_.get(obj, 'spec.selector')}
                namespace={obj.metadata.namespace}
              />
            </dd>
            {machineRole && <React.Fragment>
              <dt>Machine Role</dt>
              <dd>{machineRole}</dd>
            </React.Fragment>}
            {region && <React.Fragment>
              <dt>AWS Region</dt>
              <dd>{region}</dd>
            </React.Fragment>}
            {availabilityZone && <React.Fragment>
              <dt>AWS Availability Zone</dt>
              <dd>{availabilityZone}</dd>
            </React.Fragment>}
          </ResourceSummary>
        </div>
        <div className="col-sm-6">
          <dl className="co-m-pane__details">
            <dt>Strategy</dt>
            <dd>{_.get(obj, 'spec.strategy.type') || '-'}</dd>
            {rollingUpdateStrategy && <React.Fragment>
              <dt>Max Unavailable</dt>
              <dd>{rollingUpdateStrategy.maxUnavailable || 0} of {pluralize(obj.spec.replicas, 'machine')}</dd>
              <dt>Max Surge</dt>
              <dd>{rollingUpdateStrategy.maxSurge || 1} greater than {pluralize(obj.spec.replicas, 'machine')}</dd>
            </React.Fragment>}
            <dt>Min Ready Seconds</dt>
            <dd>{minReadySeconds ? pluralize(minReadySeconds, 'second') : 'Not Configured'}</dd>
            {progressDeadlineSeconds && <dt>Progress Deadline</dt>}
            {progressDeadlineSeconds && <dd>{/* Convert to ms for formatDuration */ formatDuration(progressDeadlineSeconds * 1000)}</dd>}
          </dl>
        </div>
      </div>
    </div>
  </React.Fragment>;
};

export const MachineDeploymentList: React.SFC = props => <React.Fragment>
  <Table
    {...props}
    aria-label="Machine Deployments"
    Header={MachineDeploymentTableHeader}
    Row={MachineDeploymentTableRow}
    virtualize />
  {false && <List
    {...props}
    Header={MachineDeploymentHeader}
    Row={MachineDeploymentRow}
  />}
</React.Fragment>;

export const MachineDeploymentPage: React.SFC<MachineDeploymentPageProps> = props =>
  <ListPage
    {...props}
    ListComponent={MachineDeploymentList}
    kind={machineDeploymentReference}
    canCreate
  />;

export const MachineDeploymentDetailsPage: React.SFC<MachineDeploymentDetailsPageProps> = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  kind={machineDeploymentReference}
  pages={[navFactory.details(MachineDeploymentDetails), navFactory.editYaml(), navFactory.machines(MachineTabPage)]}
/>;

export type MachineDeploymentRowProps = {
  obj: MachineDeploymentKind;
};

export type MachineDeploymentDetailsProps = {
  obj: MachineDeploymentKind;
};

export type MachineDeploymentPageProps = {
  showTitle?: boolean;
  namespace?: string;
  selector?: any;
};

export type MachineDeploymentDetailsPageProps = {
  match: any;
};
