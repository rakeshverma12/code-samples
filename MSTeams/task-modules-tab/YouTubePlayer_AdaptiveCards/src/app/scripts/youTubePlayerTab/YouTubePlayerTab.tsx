import * as React from "react";
import {
    Provider,
    Flex,
    Text,
    Button,
    Header,
    ThemePrepared,
    themes,
    Input
} from "@fluentui/react-northstar";
import TeamsBaseComponent, { ITeamsBaseComponentState } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
/**
 * State for the youTubePlayerTabTab React component
 */
export interface IYouTubePlayerTabState extends ITeamsBaseComponentState {
    entityId?: string;
    teamsTheme: ThemePrepared;
    youTubeVideoId?: string;
}

/**
 * Properties for the youTubePlayerTabTab React component
 */
export interface IYouTubePlayerTabProps {

}

/**
 * Implementation of the YouTube Player content page
 */
export class YouTubePlayerTab extends TeamsBaseComponent<IYouTubePlayerTabProps, IYouTubePlayerTabState> {

    public async componentWillMount() {
        this.updateComponentTheme(this.getQueryVariable("theme"));
        this.setState(Object.assign({}, this.state, {
            youTubeVideoId: "VlEH4vtaxp4"
        }));

        if (await this.inTeams()) {
            microsoftTeams.initialize();
            microsoftTeams.registerOnThemeChangeHandler(this.updateComponentTheme);
            microsoftTeams.getContext((context) => {
                microsoftTeams.appInitialization.notifySuccess();
                this.setState({
                    entityId: context.entityId
                });
                this.updateTheme(context.theme);
            });
        } else {
            this.setState({
                entityId: "This is not hosted in Microsoft Teams"
            });
        }
    }

    /**
     * The render() method to create the UI of the tab
     */
    public render() {
        return (
            <Provider theme={this.state.theme}>
                <Flex column gap="gap.smaller">
                    <Header>Task Module Demo</Header>
                    <Text>YouTube Video ID:</Text>
                    <Input value={this.state.youTubeVideoId} disabled></Input>
                    <Button content="Change Video ID (AdaptiveCard)" onClick={this.onChangeVideoAdaptiveCard}></Button>
                    <Button content="Show Video" primary onClick={this.onShowVideo}></Button>
                    <Text content="(C) Copyright Contoso" size="smallest"></Text>
                </Flex>
            </Provider>
        );
    }

    private onChangeVideoAdaptiveCard = (event: React.MouseEvent<HTMLButtonElement>): void => {
        // load adaptive card
        const adaptiveCard: any = require("./YouTubeSelectorCard.json");
        // update card with current video ID
        adaptiveCard.body.forEach((container: any) => {
            if (container.type === "Container") {
                container.items.forEach((item: any) => {
                    if (item.id && item.id === "youTubeVideoId") {
                        item.value = this.state.youTubeVideoId;
                    }
                });
            }
        });

        const taskModuleInfo = {
            title: "YouTube Video Selector",
            card: adaptiveCard,
            width: 350,
            height: 250
        };

        const submitHandler = (err: string, result: any): void => {
            this.setState(Object.assign({}, this.state, {
                youTubeVideoId: result.youTubeVideoId
            }));
        };

        microsoftTeams.tasks.startTask(taskModuleInfo, submitHandler);
    }

    private appRoot(): string {
        if (typeof window === "undefined") {
            return "https://{{HOSTNAME}}";
        } else {
            return window.location.protocol + "//" + window.location.host;
        }
    }

    private onShowVideo = (event: React.MouseEvent<HTMLButtonElement>): void => {
        const taskModuleInfo = {
            title: "YouTube Player",
            url: this.appRoot() + `/youTubePlayerTab/player.html?vid=${this.state.youTubeVideoId}`,
            width: 1000,
            height: 700
        };
        microsoftTeams.tasks.startTask(taskModuleInfo);
    }

    private updateComponentTheme = (teamsTheme: string = "default"): void => {
        let theme: ThemePrepared;

        switch (teamsTheme) {
            case "default":
                theme = themes.teams;
                break;
            case "dark":
                theme = themes.teamsDark;
                break;
            case "contrast":
                theme = themes.teamsHighContrast;
                break;
            default:
                theme = themes.teams;
                break;
        }
        // update the state
        this.setState(Object.assign({}, this.state, {
            teamsTheme: theme
        }));
    }
}
