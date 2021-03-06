import * as React from "react";
import * as System from "~/components/system";
import * as Actions from "~/common/actions";
import * as Constants from "~/common/constants";
import * as SVG from "~/common/svg";

import { css } from "@emotion/core";
import { ButtonPrimary, ButtonSecondary } from "~/components/system/components/Buttons";
import { dispatchCustomEvent } from "~/common/custom-events";

import ScenePage from "~/components/core/ScenePage";
import Profile from "~/components/core/Profile";

const STYLES_BUTTONS = css`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
`;

const STATUS_BUTTON_MAP = {
  trusted: "Remove peer",
  untrusted: "Add peer",
  sent: "Cancel request",
  received: "Accept request",
};

export default class SceneProfile extends React.Component {
  _handleTrust = async (trustStatus, trustId) => {
    if (trustStatus === "untrusted" || trustStatus === "sent") {
      await Actions.createTrustRelationship({
        userId: this.props.data.id,
      });
    } else if (trustStatus === "received") {
      await Actions.updateTrustRelationship({
        userId: this.props.data.id,
      });
    } else {
      await Actions.deleteTrustRelationship({
        id: trustId,
      });
    }
  };

  _handleFollow = async () => {
    await Actions.createSubscription({
      userId: this.props.data.id,
    });
  };

  render() {
    let trustId, followStatus, relation;
    let trustStatus = "untrusted";
    let viewer = this.props.viewer;
    let trust = viewer.trusted.filter((entry) => {
      return entry.target_user_id === this.props.data.id;
    });
    if (trust.length) {
      relation = trust[0];
      trustId = relation.id;
      if (relation.data.verified) {
        trustStatus = "trusted";
      } else {
        trustStatus = "sent";
      }
    }
    let pendingTrust = viewer.pendingTrusted.filter((entry) => {
      return entry.owner_user_id === this.props.data.id;
    });
    if (pendingTrust.length) {
      relation = pendingTrust[0];
      trustId = relation.id;
      if (pendingTrust[0].data.verified) {
        trustStatus = "trusted";
      } else {
        trustStatus = "received";
      }
    }
    followStatus = !!viewer.subscriptions.filter((entry) => {
      return entry.target_user_id === this.props.data.id;
    }).length;

    let buttons = (
      <div css={STYLES_BUTTONS}>
        {followStatus ? (
          <ButtonSecondary
            style={{ margin: "16px 8px 0 0", minWidth: 152 }}
            onClick={this._handleFollow}
          >
            Unfollow
          </ButtonSecondary>
        ) : (
          <ButtonPrimary
            style={{ margin: "16px 8px 0 0", minWidth: 152 }}
            onClick={this._handleFollow}
          >
            Follow
          </ButtonPrimary>
        )}
        {trustStatus === "untrusted" || trustStatus === "received" ? (
          <ButtonPrimary
            style={{ margin: "16px 8px 0 0", minWidth: 152 }}
            onClick={() => this._handleTrust(trustStatus, trustId)}
          >
            {STATUS_BUTTON_MAP[trustStatus]}
          </ButtonPrimary>
        ) : (
          <ButtonSecondary
            style={{ margin: "16px 8px 0 0", minWidth: 152 }}
            onClick={() => this._handleTrust(trustStatus, trustId)}
          >
            {STATUS_BUTTON_MAP[trustStatus]}
          </ButtonSecondary>
        )}
      </div>
    );
    return (
      <ScenePage>
        <Profile
          {...this.props}
          onAction={this.props.onAction}
          creator={this.props.data}
          sceneId={this.props.sceneId}
          buttons={this.props.viewer.username === this.props.data.username ? null : buttons}
          isOwner={this.props.viewer.username === this.props.data.username}
        />
      </ScenePage>
    );
  }
}
