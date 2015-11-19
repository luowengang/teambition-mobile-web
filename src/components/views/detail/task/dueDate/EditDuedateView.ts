/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @inject([
    'DetailAPI'
  ])
  class EditDuedateView extends View {
    public ViewName = 'EditDuedateView';
    public task: ITaskDataParsed;

    private DetailAPI: IDetailAPI;
    private taskid: string;
    private displayDuedate: Date;
    private hasDueDate: boolean;
    constructor() {
      super();
      this.zone.run(() => {
        this.taskid = this.$state.params._id;
      });
    }

    public onInit() {
      return this.DetailAPI.fetch(this.taskid, 'task')
      .then((task: ITaskDataParsed) => {
        this.task = task;
        this.displayDuedate = this.task.displayDuedate;
        this.hasDueDate = !!this.task.dueDate;
      });
    }

    public onAllChangesDone() {
      if (Ding) {
        Ding.setRight('确定', true, false, () => {
          this.updateDueDate();
        });
      }
    }

    public resetDueDate() {
      this.displayDuedate = this.hasDueDate ? this.displayDuedate || new Date() : null;
    }

    private updateDueDate() {
      this.showLoading();
      let displayDuedate = this.displayDuedate ? this.displayDuedate.toISOString() : null;
      this.DetailAPI.update(this.taskid, 'task', {
        dueDate: displayDuedate
      }, 'dueDate')
      .then(() => {
        this.hideLoading();
        window.history.back();
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.showMsg('error', '更新任务出错', message);
        this.hideLoading();
        window.history.back();
      });
    }
  }

  angular.module('teambition').controller('EditDuedateView', EditDuedateView);
}
