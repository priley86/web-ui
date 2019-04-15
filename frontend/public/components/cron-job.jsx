import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { ColHead, DetailsPage, List, ListHeader, ListPage, Table, Vr, Vd } from './factory';
import { Kebab, ContainerTable, navFactory, ResourceKebab, SectionHeading, ResourceLink, ResourceSummary, Timestamp } from './utils';
import { ResourceEventStream } from './events';

const { common } = Kebab.factory;
const menuActions = [...common];

const kind = 'CronJob';

const tableColumnClasses = [
  classNames('pf-m-2-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-2-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-2-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  classNames('pf-m-3-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-hidden', 'pf-m-visible-on-lg'),
  classNames('pf-m-3-col-on-xl', 'pf-m-hidden', 'pf-m-visible-on-xl'),
  Kebab.columnClass,
];

const Header = props => <ListHeader>
  <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 col-xs-6" sortField="metadata.namespace">Namespace</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-3 col-sm-4 hidden-xs" sortField="spec.schedule">Schedule</ColHead>
  <ColHead {...props} className="col-lg-3 col-md-3 hidden-sm hidden-xs" sortField="spec.schedule">Concurrency Policy</ColHead>
  <ColHead {...props} className="col-lg-3 hidden-md hidden-sm hidden-xs" sortField="spec.schedule">Starting Deadline Seconds</ColHead>
</ListHeader>;

export const CronJobTableHeader = () => {
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
      title: 'Schedule', sortField: 'spec.schedule', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
    {
      title: 'Concurrency Policy', sortField: 'spec.schedule', transforms: [sortable],
      props: { className: tableColumnClasses[3]},
    },
    {
      title: 'Starting Deadline Seconds', sortField: 'spec.schedule', transforms: [sortable],
      props: { className: tableColumnClasses[4]},
    },
    { title: '',
      props: { className: tableColumnClasses[5]},
    },
  ];
};
CronJobTableHeader.displayName = 'CronJobTableHeader';

const Row = ({obj: cronjob}) => <div className="row co-resource-list__item">
  <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6">
    <ResourceLink kind={kind} name={cronjob.metadata.name} title={cronjob.metadata.name} namespace={cronjob.metadata.namespace} />
  </div>
  <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 co-break-word">
    <ResourceLink kind="Namespace" name={cronjob.metadata.namespace} title={cronjob.metadata.namespace} />
  </div>
  <div className="col-lg-2 col-md-3 col-sm-4 hidden-xs">
    {cronjob.spec.schedule}
  </div>
  <div className="col-lg-3 col-md-3 hidden-sm hidden-xs">
    {_.get(cronjob.spec, 'concurrencyPolicy', '-')}
  </div>
  <div className="col-lg-3 hidden-md hidden-sm hidden-xs">
    {_.get(cronjob.spec, 'startingDeadlineSeconds', '-')}
  </div>
  <div className="dropdown-kebab-pf">
    <ResourceKebab actions={menuActions} kind={kind} resource={cronjob} />
  </div>
</div>;

const CronJobTableRow = ({obj: cronjob, index, key, style}) => {
  return (
    <Vr id={cronjob.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={cronjob.metadata.name} title={cronjob.metadata.name} namespace={cronjob.metadata.namespace} />
      </Vd>
      <Vd className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={cronjob.metadata.namespace} title={cronjob.metadata.namespace} />
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        {cronjob.spec.schedule}
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        {_.get(cronjob.spec, 'concurrencyPolicy', '-')}
      </Vd>
      <Vd className={tableColumnClasses[4]}>
        {_.get(cronjob.spec, 'startingDeadlineSeconds', '-')}
      </Vd>
      <Vd className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={cronjob} />
      </Vd>
    </Vr>
  );
};
CronJobTableRow.displayName = 'CronJobTableRow';

const Details = ({obj: cronjob}) => {
  const job = cronjob.spec.jobTemplate;
  return <React.Fragment>
    <div className="co-m-pane__body">
      <div className="row">
        <div className="col-md-6">
          <SectionHeading text="CronJob Overview" />
          <ResourceSummary resource={cronjob}>
            <dt>Schedule</dt>
            <dd>{cronjob.spec.schedule}</dd>
            <dt>Concurrency Policy</dt>
            <dd>{cronjob.spec.concurrencyPolicy || '-'}</dd>
            <dt>Starting Deadline Seconds</dt>
            <dd>{cronjob.spec.startingDeadlineSeconds || '-'}</dd>
            <dt>Last Schedule Time</dt>
            <dd><Timestamp timestamp={cronjob.status.lastScheduleTime} /></dd>
          </ResourceSummary>
        </div>
        <div className="col-md-6">
          <SectionHeading text="Job Overview" />
          <dl className="co-m-pane__details">
            <dt>Desired Completions</dt>
            <dd>{job.spec.completions || '-'}</dd>
            <dt>Parallelism</dt>
            <dd>{job.spec.parallelism || '-'}</dd>
            <dt>Deadline</dt>
            <dd>{job.spec.activeDeadlineSeconds ? `${job.spec.activeDeadlineSeconds} seconds` : '-'}</dd>
          </dl>
        </div>
      </div>
    </div>
    <div className="co-m-pane__body">
      <SectionHeading text="Containers" />
      <ContainerTable containers={job.spec.template.spec.containers} />
    </div>
  </React.Fragment>;
};

export const CronJobsList = props => <React.Fragment>
  <Table {...props} aria-label="Cron Jobs" Header={CronJobTableHeader} Row={CronJobTableRow} virtualize />
  {false && <List {...props} Header={Header} Row={Row} />}
</React.Fragment>;
export const CronJobsPage = props => <ListPage {...props} ListComponent={CronJobsList} kind={kind} canCreate={true} />;

export const CronJobsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[navFactory.details(Details), navFactory.editYaml(), navFactory.events(ResourceEventStream)]}
/>;
