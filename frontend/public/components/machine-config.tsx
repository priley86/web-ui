import * as _ from 'lodash-es';
import * as React from 'react';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import { MachineConfigKind, referenceForModel } from '../module/k8s';
import { MachineConfigModel } from '../models';
import { fromNow } from './utils/datetime';
import {
  ColHead,
  DetailsPage,
  List,
  ListHeader,
  ListPage,
  Table,
  Vr,
  Vd,
} from './factory';
import {
  Kebab,
  navFactory,
  ResourceKebab,
  ResourceLink,
  ResourceSummary,
  SectionHeading,
} from './utils';


export const machineConfigReference = referenceForModel(MachineConfigModel);
const machineConfigMenuActions = [...Kebab.factory.common];

const MachineConfigSummary: React.SFC<MachineConfigSummaryProps> = ({obj}) => (
  <ResourceSummary resource={obj}>
    <dt>OS Image URL</dt>
    <dd>{obj.spec.osImageURL || '-'}</dd>
  </ResourceSummary>
);

const MachineConfigDetails: React.SFC<MachineConfigDetailsProps> = ({obj}) => (
  <div className="co-m-pane__body">
    <SectionHeading text="Machine Config Overview" />
    <div className="row">
      <div className="col-xs-12">
        <MachineConfigSummary obj={obj} />
      </div>
    </div>
  </div>
);

const pages = [
  navFactory.details(MachineConfigDetails),
  navFactory.editYaml(),
];

export const MachineConfigDetailsPage: React.SFC<any> = props => {
  return <DetailsPage {...props} kind={machineConfigReference} menuActions={machineConfigMenuActions} pages={pages} />;
};

const tableColumnClasses = [
  classNames('pf-m-2-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-3-col-on-xl', 'pf-m-4-col-on-lg', 'pf-m-6-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  classNames('pf-m-3-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-hidden', 'pf-m-visible-on-lg'),
  classNames('pf-m-2-col-on-xl', 'pf-m-hidden', 'pf-m-visible-on-xl'),
  classNames('pf-m-2-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-2-col-on-md', 'pf-m-6-col-on-sm'),
  Kebab.columnClass,
];

const MachineConfigHeader: React.SFC<any> = props => <ListHeader>
  <ColHead {...props} className="col-xs-6  col-sm-4  col-md-3  col-lg-2" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="hidden-xs col-sm-6  col-md-4  col-lg-3" sortField="metadata.annotations['machineconfiguration.openshift.io/generated-by-controller-version']">Generated By Controller</ColHead>
  <ColHead {...props} className="hidden-xs hidden-sm col-md-3  col-lg-3" sortField="spec.config.ignition.version">Ignition Version</ColHead>
  <ColHead {...props} className="hidden-xs hidden-sm hidden-md col-lg-2" sortField="spec.osImageURL">OS Image URL</ColHead>
  <ColHead {...props} className="col-xs-6  col-sm-2  col-md-2  col-lg-2" sortField="metadata.creationTimestamp">Created</ColHead>
</ListHeader>;

export const MachineConfigTableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'Generated By Controller',
      sortField: 'metadata.annotations[\'machineconfiguration.openshift.io/generated-by-controller-version\']',
      transforms: [sortable], props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Ignition Version', sortField: 'spec.config.ignition.version', transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'OS Image URL', sortField: 'spec.osImageURL',
      transforms: [sortable], props: { className: tableColumnClasses[3] },
    },
    {
      title: 'Created', sortField: 'metadata.creationTimestamp',
      transforms: [sortable], props: { className: tableColumnClasses[4] },
    },
    {
      title: '', props: { className: tableColumnClasses[5] },
    },
  ];
};
MachineConfigTableHeader.displayName = 'MachineConfigTableHeader';

const MachineConfigRow: React.SFC<MachineConfigRowProps> = ({obj}) => <div className="row co-resource-list__item">
  <div className="col-xs-6 col-sm-4 col-md-3 col-lg-2">
    <ResourceLink kind={machineConfigReference} name={obj.metadata.name} title={obj.metadata.name} />
  </div>
  <div className="hidden-xs col-sm-6 col-md-4 col-lg-3 co-break-word">
    { _.get(obj, ['metadata', 'annotations', 'machineconfiguration.openshift.io/generated-by-controller-version'], '-')}
  </div>
  <div className="hidden-xs hidden-sm col-md-3 col-lg-3">
    {_.get(obj, 'spec.config.ignition.version') || '-'}
  </div>
  <div className="hidden-xs hidden-sm hidden-md col-lg-2 co-break-word">
    {_.get(obj, 'spec.osImageURL') || '-'}
  </div>
  <div className="col-xs-6 col-sm-2 col-md-2 col-lg-2">
    {fromNow(obj.metadata.creationTimestamp)}
  </div>
  <div className="dropdown-kebab-pf">
    <ResourceKebab actions={machineConfigMenuActions} kind={machineConfigReference} resource={obj} />
  </div>
</div>;

export const MachineConfigTableRow: React.FC<MachineConfigTableRowProps> = ({obj, index, key, style}) => {
  return (
    <Vr id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind={machineConfigReference} name={obj.metadata.name} title={obj.metadata.name} />
      </Vd>
      <Vd className={classNames(tableColumnClasses[1], 'co-break-word')}>
        { _.get(obj, ['metadata', 'annotations', 'machineconfiguration.openshift.io/generated-by-controller-version'], '-')}
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        {_.get(obj, 'spec.config.ignition.version') || '-'}
      </Vd>
      <Vd className={classNames(tableColumnClasses[3], 'co-break-word')}>
        {_.get(obj, 'spec.osImageURL') || '-'}
      </Vd>
      <Vd className={tableColumnClasses[4]}>
        {fromNow(obj.metadata.creationTimestamp)}
      </Vd>
      <Vd className={tableColumnClasses[5]}>
        <ResourceKebab actions={machineConfigMenuActions} kind={machineConfigReference} resource={obj} />
      </Vd>
    </Vr>
  );
};
MachineConfigTableRow.displayName = 'MachineConfigTableRow';
export type MachineConfigTableRowProps = {
  obj: MachineConfigKind;
  index: number;
  key?: string;
  style: object;
};

const MachineConfigList: React.SFC<any> = props => <React.Fragment>
  <Table
    {...props}
    aria-label="Machine Configs"
    Header={MachineConfigTableHeader}
    Row={MachineConfigTableRow}
    virtualize />
  {false && <List
    {...props}
    Header={MachineConfigHeader}
    Row={MachineConfigRow}
  />}
</React.Fragment>;

export const MachineConfigPage: React.SFC<any> = ({canCreate = true, ...rest}) => (
  <ListPage
    {...rest}
    canCreate={canCreate}
    ListComponent={MachineConfigList}
    kind={machineConfigReference}
  />
);

type MachineConfigRowProps = {
  obj: MachineConfigKind;
};

type MachineConfigDetailsProps = {
  obj: MachineConfigKind;
};

type MachineConfigSummaryProps = {
  obj: MachineConfigKind;
};
