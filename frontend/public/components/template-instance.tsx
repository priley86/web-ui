import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
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
import { Conditions } from './conditions';
import { getTemplateInstanceStatus, referenceFor, TemplateInstanceKind } from '../module/k8s';
import {
  EmptyBox,
  Kebab,
  navFactory,
  ResourceKebab,
  ResourceLink,
  ResourceSummary,
  SectionHeading,
  StatusIconAndText,
} from './utils';

const menuActions = Kebab.factory.common;

const tableColumnClasses = [
  classNames('pf-m-5-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-5-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-2-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  Kebab.columnClass,
];

const TemplateInstanceHeader = props => <ListHeader>
  <ColHead {...props} className="col-sm-5 col-xs-6" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-sm-5 col-xs-6" sortField="metadata.namespace">Namespace</ColHead>
  <ColHead {...props} className="col-sm-2 hidden-xs" sortFunc="getTemplateInstanceStatus">Status</ColHead>
</ListHeader>;

export const TemplateInstanceTableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[0]},
    },
    {
      title: 'Namespace', sortField: 'metadata.namespace', transforms: [sortable],
      props: { className: tableColumnClasses[1]},
    },
    {
      title: 'Status', sortFunc: 'getTemplateInstanceStatus', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
    {
      title: '',
      props: { className: tableColumnClasses[3]},
    },
  ];
};
TemplateInstanceTableHeader.displayName = 'TemplateInstanceTableHeader';

const TemplateInstanceRow: React.SFC<TemplateInstanceRowProps> = ({obj}) => (
  <div className="row co-resource-list__item">
    <div className="col-sm-5 col-xs-6 co-break-word">
      <ResourceLink kind="TemplateInstance" name={obj.metadata.name} namespace={obj.metadata.namespace} />
    </div>
    <div className="col-sm-5 col-xs-6 co-break-word">
      <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
    </div>
    <div className="col-sm-2 hidden-xs">
      <StatusIconAndText status={getTemplateInstanceStatus(obj)} />
    </div>
    <div className="dropdown-kebab-pf">
      <ResourceKebab actions={menuActions} kind="TemplateInstance" resource={obj} />
    </div>
  </div>
);

export const TemplateInstanceTableRow: React.FC<TemplateInstanceTableRowProps> = ({obj, index, key, style}) => {
  return (
    <Vr id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={classNames(tableColumnClasses[0], 'co-break-word')}>
        <ResourceLink kind="TemplateInstance" name={obj.metadata.name} namespace={obj.metadata.namespace} />
      </Vd>
      <Vd className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        <StatusIconAndText status={getTemplateInstanceStatus(obj)} />
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        <ResourceKebab actions={menuActions} kind="TemplateInstance" resource={obj} />
      </Vd>
    </Vr>
  );
};
TemplateInstanceTableRow.displayName = 'TemplateInstanceTableRow';
export type TemplateInstanceTableRowProps = {
  obj: TemplateInstanceKind;
  index: number;
  key?: string;
  style: object;
};

export const TemplateInstanceList: React.SFC = props => <React.Fragment>
  <Table {...props} aria-label="Template Instances" Header={TemplateInstanceTableHeader} Row={TemplateInstanceTableRow} virtualize />
  {false && <List {...props} Header={TemplateInstanceHeader} Row={TemplateInstanceRow} /> }
</React.Fragment>;

const allStatuses = ['Ready', 'Not Ready', 'Failed'];

const filters = [{
  type: 'template-instance-status',
  selected: allStatuses,
  reducer: getTemplateInstanceStatus,
  items: _.map(allStatuses, status => ({
    id: status,
    title: status,
  })),
}];

export const TemplateInstancePage: React.SFC<TemplateInstancePageProps> = props =>
  <ListPage
    {...props}
    title="Template Instances"
    kind="TemplateInstance"
    ListComponent={TemplateInstanceList}
    canCreate={false}
    rowFilters={filters}
  />;

const TemplateInstanceDetails: React.SFC<TemplateInstanceDetailsProps> = ({obj}) => {
  const status = getTemplateInstanceStatus(obj);
  const secretName = _.get(obj, 'spec.secret.name');
  const requester = _.get(obj, 'spec.requester.username');
  const objects = _.get(obj, 'status.objects', []);
  const conditions = _.get(obj, 'status.conditions', []);
  return (
    <React.Fragment>
      <div className="co-m-pane__body">
        <SectionHeading text="Template Instance Overview" />
        <div className="co-m-pane__body-group">
          <div className="row">
            <div className="col-sm-6">
              <ResourceSummary resource={obj} />
            </div>
            <div className="col-sm-6">
              <dl className="co-m-pane__details">
                <dt>Status</dt>
                <dd><StatusIconAndText status={status} /></dd>
                {secretName && (
                  <React.Fragment>
                    <dt>Parameters</dt>
                    <dd>
                      <ResourceLink kind="Secret" name={secretName} namespace={obj.metadata.namespace} />
                    </dd>
                  </React.Fragment>
                )}
                <dt>Requester</dt>
                <dd>{requester || '-'}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text="Objects" />
        <div className="co-m-table-grid co-m-table-grid--bordered">
          <div className="row co-m-table-grid__head">
            <div className="col-sm-6">Name</div>
            <div className="col-sm-6">Namespace</div>
          </div>
          <div className="co-m-table-grid__body">
            {_.isEmpty(objects)
              ? <EmptyBox label="Objects" />
              : _.map(objects, ({ref}, i) => (
                <div className="row co-resource-list__item" key={i}>
                  <div className="col-sm-6">
                    <ResourceLink kind={referenceFor(ref)} name={ref.name} namespace={ref.namespace} />
                  </div>
                  <div className="col-sm-6">
                    {ref.namespace ? <ResourceLink kind="Namespace" name={ref.namespace} /> : '-'}
                  </div>
                </div>))}
          </div>
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading text="Conditions" />
        <Conditions conditions={conditions} />
      </div>
    </React.Fragment>
  );
};

export const TemplateInstanceDetailsPage: React.SFC<TemplateInstanceDetailsPageProps> = props =>
  <DetailsPage
    {...props}
    kind="TemplateInstance"
    menuActions={menuActions}
    pages={[navFactory.details(TemplateInstanceDetails), navFactory.editYaml()]}
  />;

type TemplateInstanceRowProps = {
  obj: TemplateInstanceKind;
};

type TemplateInstancePageProps = {
  autoFocus?: boolean;
  showTitle?: boolean;
};

type TemplateInstanceDetailsProps = {
  obj: TemplateInstanceKind;
};

type TemplateInstanceDetailsPageProps = {
  match: any;
};
