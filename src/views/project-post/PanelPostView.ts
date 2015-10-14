/// <reference path="../../scripts/interface/teambition.d.ts" />
module teambition {
  'use strict';

  let projectId: string;

  @parentView('TabsView')
  export class PanelPostView extends View {

    public ViewName = 'PanelPostView';

    public posts: IPostData[];

    private postAPI: IPostAPI;

    constructor(
      postAPI: IPostAPI
    ) {
      super();
      this.postAPI = postAPI;
      this.zone.run(noop);
    }

    public onInit() {
      projectId = this.$state.params._id;
      return this.initFetch();
    }

    private initFetch() {
      return this.postAPI.fetchAll(projectId)
      .then((posts: IPostData[]) => {
        this.posts = posts;
      });
    }
  }

  angular.module('teambition').controller('PanelPostView', PanelPostView);
}
