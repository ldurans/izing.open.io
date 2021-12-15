/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Job } from "bull";
import axios from "axios";

/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */

export enum ExecutionType {
  DELAY = "delay",
  REPEAT = "repeat"
}

export type ExecutionOption = {
  type: ExecutionType;
  value: string | number;
  // start date and end date only supported for ExecutionType.REPEAT
  startDate?: string;
  endDate?: string;
};

export type JobConfig = {
  executionOptions: ExecutionOption;
  retryOptions?: RetryOptions;
};

export type RetryOptions = {
  attempts: number;
  fallbackUrl?: string;
};

export type RabbitMQJob = {
  data: any;
  queue: string;
};

export default class QueueListener {
  static onError(err: Error): void {
    console.error(err);
  }

  static onWaiting(jobId: string): void {
    // console.log(`Job with ID ${jobId} is waiting`);
  }

  static onActive(
    job: Job<JobConfig>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    jobPromise: Promise<Job<JobConfig>>
  ): void {
    // console.log(`Job with ID ${job.id} active`);
  }

  static onStalled(job: Job<JobConfig>): void {
    // console.log(`Job with ID ${job.id} stalled`);
    // TODO: log stalled request. These requests are most probably double processed.
  }

  static onCompleted(job: Job<JobConfig>, result: any): void {
    // console.log(`Job with ID ${job.id} completed`);
    // console.log({ result });
  }

  // eslint-disable-next-line consistent-return
  static onFailed(job: Job<JobConfig>, err: Error) {
    console.log(
      `Job with ID ${job.id} failed. Attempts made ${job.attemptsMade}. Max attempts ${job.opts.attempts}`,
      err
    );
    if (job.opts.attempts && job.attemptsMade === job.opts.attempts) {
      // if max attempts reached, execute fallback logic.
      const jobConfig = job.data;
      if (jobConfig.retryOptions?.fallbackUrl) {
        const apiBody = {
          ...jobConfig,
          id: job.id,
          error: err
        };
        // console.log("Sending fallback hook");
        return axios.post(jobConfig.retryOptions.fallbackUrl, apiBody);
      }
      // if no fallback, mail admin that the job has failed repeatedly
      const {
        id: jobId,
        data: jobData,
        name: jobName,
        opts: jobOpts,
        timestamp
      } = job;
      const subject = `Job - ${jobId} failed ${job.attemptsMade} times`;
      const mailBody = `
                    <h1> Job Failed Repeatedly </h1>
                    <div>
                        <p> Job ID : ${jobId} </p>
                        <p> Job Name: ${jobName} </p>
                        <p> Timestamp: ${timestamp} </p
                        <div> <p> JobData : </p>
                        <code> ${JSON.stringify(jobData)} </code> </div>
                        <div> <p> JobOptions : </p>
                        <code> ${JSON.stringify(jobOpts)} </code> </div>
                    </div>
               `;
      // return Mailer.sendMail(mailBody, subject);
      console.error("On Failed", subject, mailBody);
    }
  }

  static onClean(jobs: Job<JobConfig>[], type: string): void {
    // console.log(`Jobs cleaned ${jobs.length} - ${type}`);
    // console.log(JSON.stringify(jobs));
  }

  static onRemoved(job: Job<JobConfig>): void {
    // console.log(`Job with ID ${job.id} removed`);
  }
}
