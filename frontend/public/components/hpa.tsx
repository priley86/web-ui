import * as React from 'react';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { K8sResourceKind, K8sResourceKindReference } from '../module/k8s';
import { Conditions } from './conditions';
import { ColHead, DetailsPage, List, ListHeader, ListPage, Table, Vr, Vd } from './factory';
import { Kebab, SectionHeading, LabelList, navFactory, ResourceKebab, ResourceLink, ResourceSummary, Timestamp } from './utils';
import { ResourceEventStream } from './events';

const HorizontalPodAutoscalersReference: K8sResourceKindReference = 'HorizontalPodAutoscaler';

const { common } = Kebab.factory;
const menuActions = [...common];

const MetricsRow: React.SFC<MetricsRowProps> = ({type, current, target}) => <div className="row">
  <div className="col-xs-6">
    {type}
  </div>
  <div className="col-xs-3">
    {current || '-'}
  </div>
  <div className="col-xs-3">
    {target || '-'}
  </div>
</div>;

const externalRow = (metric, current, key) => {
  const { external } = metric;
  const type = external.metricName;
  // TODO: show metric selector for external metrics?
  const currentValue = external.targetAverageValue
    ? _.get(current, 'object.currentAverageValue')
    : _.get(current, 'object.currentValue');
  const targetValue = external.targetAverageValue
    ? external.targetAverageValue
    : external.targetValue;

  return <MetricsRow key={key} type={type} current={currentValue} target={targetValue} />;
};

const objectRow = (metric, current, ns, key) => {
  const { object } = metric;
  const type = <React.Fragment>
    {object.metricName} on
    <ResourceLink kind={object.target.kind} name={object.target.name} namespace={ns} title={object.target.name} />
  </React.Fragment>;
  const currentValue = _.get(current, 'object.currentValue');
  const targetValue = object.targetValue;

  return <MetricsRow key={key} type={type} current={currentValue} target={targetValue} />;
};

const podRow = (metric, current, key) => {
  const { pods } = metric;
  const type = `${pods.metricName} on pods`;
  const currentValue = _.get(current, 'pods.currentAverageValue');
  const targetValue = pods.targetAverageValue;

  return <MetricsRow key={key} type={type} current={currentValue} target={targetValue} />;
};

const getResourceUtilization = currentMetric => {
  const currentUtilization = _.get(currentMetric, 'resource.currentAverageUtilization');

  // Use _.isFinite so that 0 evaluates to true, but null / undefined / NaN don't
  if (!_.isFinite(currentUtilization)) {
    return null;
  }

  const currentAverageValue = _.get(currentMetric, 'resource.currentAverageValue');
  // Only show currentAverageValue in parens if set and non-zero to avoid things like "0% (0)"
  return currentAverageValue && currentAverageValue !== '0'
    ? `${currentUtilization}% (${currentAverageValue})`
    : `${currentUtilization}%`;
};

const resourceRow = (metric, current, key) => {
  const targetUtilization = metric.resource.targetAverageUtilization;
  const resourceLabel = `resource ${metric.resource.name}`;
  const type = targetUtilization
    ? <React.Fragment>{resourceLabel}&nbsp;<span className="small text-muted">(as a percentage of request)</span></React.Fragment>
    : resourceLabel;
  const currentValue = targetUtilization
    ? getResourceUtilization(current)
    : _.get(current, 'resource.currentAverageValue');
  const targetValue = targetUtilization
    ? `${targetUtilization}%`
    : metric.resource.targetAverageValue;

  return <MetricsRow key={key} type={type} current={currentValue} target={targetValue} />;
};

const MetricsTable: React.SFC<MetricsTableProps> = ({obj: hpa}) => {
  return <React.Fragment>
    <SectionHeading text="Metrics" />
    <div className="co-m-table-grid co-m-table-grid--bordered">
      <div className="row co-m-table-grid__head">
        <div className="col-xs-6">Type</div>
        <div className="col-xs-3">Current</div>
        <div className="col-xs-3">Target</div>
      </div>
      <div className="co-m-table-grid__body">
        {hpa.spec.metrics.map((metric, i) => {
          // https://github.com/kubernetes/api/blob/master/autoscaling/v2beta1/types.go
          const current = _.get(hpa, ['status', 'currentMetrics', i]);
          switch (metric.type) {
            case 'External':
              return externalRow(metric, current, i);
            case 'Object':
              return objectRow(metric, current, hpa.metadata.namespace, i);
            case 'Pods':
              return podRow(metric, current, i);
            case 'Resource':
              return resourceRow(metric, current, i);
            default:
              return <div key={i} className="row">
                <div className="col-xs-12">
                  {metric.type} <span className="small text-muted">(unrecognized type)</span>
                </div>
              </div>;
          }
        })}
      </div>
    </div>
  </React.Fragment>;
};

export const HorizontalPodAutoscalersDetails: React.SFC<HorizontalPodAutoscalersDetailsProps> = ({obj: hpa}) => <React.Fragment>
  <div className="co-m-pane__body">
    <SectionHeading text="Horizontal Pod Autoscaler Overview" />
    <div className="row">
      <div className="col-sm-6">
        <ResourceSummary resource={hpa} />
      </div>
      <div className="col-sm-6">
        <dl className="co-m-pane__details">
          <dt>Scale Target</dt>
          <dd>
            <ResourceLink kind={hpa.spec.scaleTargetRef.kind} name={hpa.spec.scaleTargetRef.name} namespace={hpa.metadata.namespace} title={hpa.spec.scaleTargetRef.name} />
          </dd>
          <dt>Min Pods</dt>
          <dd>{hpa.spec.minReplicas}</dd>
          <dt>Max Pods</dt>
          <dd>{hpa.spec.maxReplicas}</dd>
          <dt>Last Scale Time</dt>
          <dd><Timestamp timestamp={hpa.status.lastScaleTime} /></dd>
          <dt>Current Pods</dt>
          <dd>{hpa.status.currentReplicas}</dd>
          <dt>Desired Pods</dt>
          <dd>{hpa.status.desiredReplicas}</dd>
        </dl>
      </div>
    </div>
  </div>
  <div className="co-m-pane__body">
    <MetricsTable obj={hpa} />
  </div>
  <div className="co-m-pane__body">
    <SectionHeading text="Conditions" />
    <Conditions conditions={hpa.status.conditions} />
  </div>
</React.Fragment>;

const pages = [navFactory.details(HorizontalPodAutoscalersDetails), navFactory.editYaml(), navFactory.events(ResourceEventStream)];
export const HorizontalPodAutoscalersDetailsPage: React.SFC<HorizontalPodAutoscalersDetailsPageProps> = props =>
  <DetailsPage
    {...props}
    kind={HorizontalPodAutoscalersReference}
    menuActions={menuActions}
    pages={pages} />;
HorizontalPodAutoscalersDetailsPage.displayName = 'HorizontalPodAutoscalersDetailsPage';

const tableColumnClasses = [
  classNames('pf-m-3-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-2-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-3-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  classNames('pf-m-2-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-hidden', 'pf-m-visible-on-lg'),
  classNames('pf-m-1-col-on-xl', 'pf-m-hidden', 'pf-m-visible-on-xl'),
  classNames('pf-m-1-col-on-xl', 'pf-m-hidden', 'pf-m-visible-on-xl'),
  Kebab.columnClass,
];

const kind = 'HorizontalPodAutoscaler';

const HorizontalPodAutoscalersHeader = props => <ListHeader>
  <ColHead {...props} className="col-lg-3 col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6 " sortField="metadata.namespace">Namespace</ColHead>
  <ColHead {...props} className="col-lg-3 col-md-3 col-sm-4 hidden-xs" sortField="metadata.labels">Labels</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-3 hidden-sm hidden-xs" sortField="spec.scaleTargetRef.name">Scale Target</ColHead>
  <ColHead {...props} className="col-lg-1 hidden-md hidden-sm hidden-xs" sortField="spec.minReplicas">Min Pods</ColHead>
  <ColHead {...props} className="col-lg-1 hidden-md hidden-sm hidden-xs" sortField="spec.maxReplicas">Max Pods</ColHead>
</ListHeader>;

export const HorizontalPodAutoscalersTableHeader = () => {
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
      title: 'Labels', sortField: 'metadata.labels', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
    {
      title: 'Scale Target', sortField: 'spec.scaleTargetRef.name', transforms: [sortable],
      props: { className: tableColumnClasses[3]},
    },
    {
      title: 'Min Pods', sortField: 'spec.minReplicas', transforms: [sortable],
      props: { className: tableColumnClasses[4]},
    },
    {
      title: 'Max Pods', sortField: 'spec.maxReplicas', transforms: [sortable],
      props: { className: tableColumnClasses[5]},
    },
    { title: '',
      props: { className: tableColumnClasses[6]},
    },
  ];
};
HorizontalPodAutoscalersTableHeader.displayName = 'HorizontalPodAutoscalersTableHeader';

const HorizontalPodAutoscalersRow: React.SFC<HorizontalPodAutoscalersRowProps> = ({obj}) => <div className="row co-resource-list__item">
  <div className="col-lg-3 col-md-3 col-sm-4 col-xs-6">
    <ResourceLink kind={HorizontalPodAutoscalersReference} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
  </div>
  <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-break-word">
    <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
  </div>
  <div className="col-lg-3 col-md-3 col-sm-4 hidden-xs">
    <LabelList kind="HorizontalPodAutoscaler" labels={obj.metadata.labels} />
  </div>
  <div className="col-lg-2 col-md-3 hidden-sm hidden-xs co-break-word">
    <ResourceLink kind={obj.spec.scaleTargetRef.kind} name={obj.spec.scaleTargetRef.name} namespace={obj.metadata.namespace} title={obj.spec.scaleTargetRef.name} />
  </div>
  <div className="col-lg-1 hidden-md hidden-sm hidden-xs">
    {obj.spec.minReplicas}
  </div>
  <div className="col-lg-1 hidden-md hidden-sm hidden-xs">
    {obj.spec.maxReplicas}
  </div>
  <div className="dropdown-kebab-pf">
    <ResourceKebab actions={menuActions} kind={HorizontalPodAutoscalersReference} resource={obj} />
  </div>
</div>;

const HorizontalPodAutoscalersTableRow: React.FC<HorizontalPodAutoscalersTableRowProps> = ({obj, index, key, style}) => {
  return (
    <Vr id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind={HorizontalPodAutoscalersReference} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </Vd>
      <Vd className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        <LabelList kind={kind} labels={obj.metadata.labels} />
      </Vd>
      <Vd className={classNames(tableColumnClasses[3], 'co-break-word')}>
        <ResourceLink kind={obj.spec.scaleTargetRef.kind} name={obj.spec.scaleTargetRef.name} namespace={obj.metadata.namespace} title={obj.spec.scaleTargetRef.name} />
      </Vd>
      <Vd className={tableColumnClasses[4]}>
        {obj.spec.minReplicas}
      </Vd>
      <Vd className={tableColumnClasses[5]}>
        {obj.spec.maxReplicas}
      </Vd>
      <Vd className={tableColumnClasses[6]}>
        <ResourceKebab actions={menuActions} kind={HorizontalPodAutoscalersReference} resource={obj} />
      </Vd>
    </Vr>
  );
};
HorizontalPodAutoscalersTableRow.displayName = 'HorizontalPodAutoscalersTableRow';
export type HorizontalPodAutoscalersTableRowProps = {
  obj: K8sResourceKind;
  index: number;
  key?: string;
  style: object;
};

const HorizontalPodAutoscalersList: React.SFC = props => <React.Fragment>
  <Table {...props} aria-label="Horizontal Pod Auto Scalers" Header={HorizontalPodAutoscalersTableHeader} Row={HorizontalPodAutoscalersTableRow} virtualize />
  {false && <List {...props} Header={HorizontalPodAutoscalersHeader} Row={HorizontalPodAutoscalersRow} /> }
</React.Fragment>;
HorizontalPodAutoscalersList.displayName = 'HorizontalPodAutoscalersList';

export const HorizontalPodAutoscalersPage: React.SFC<HorizontalPodAutoscalersPageProps> = props =>
  <ListPage
    {...props}
    kind={HorizontalPodAutoscalersReference}
    ListComponent={HorizontalPodAutoscalersList}
    canCreate={true}
  />;
HorizontalPodAutoscalersPage.displayName = 'HorizontalPodAutoscalersListPage';

export type HorizontalPodAutoscalersRowProps = {
  obj: any,
};

export type HorizontalPodAutoscalersDetailsProps = {
  obj: any,
};

export type HorizontalPodAutoscalersPageProps = {
  showTitle?: boolean,
  namespace?: string,
  selector?: any,
};

export type HorizontalPodAutoscalersDetailsPageProps = {
  match: any,
};

export type MetricsTableProps = {
  obj: any,
};

export type MetricsRowProps = {
  type: any,
  current: any,
  target: any,
};
