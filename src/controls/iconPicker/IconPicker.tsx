import * as React from 'react';
import { IIconPickerProps } from '.';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { IRenderFunction, getId } from 'office-ui-fabric-react/lib/Utilities';
import styles from './IconPicker.module.scss';
import * as strings from 'ControlStrings';
import { IconNames } from './IconNames';
import { Panel, PanelType, IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { debounce } from 'lodash';
import { IIconPickerState } from './IIconPickerState';
import * as telemetry from '../../common/telemetry';
import  {Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

initializeIcons();

export class IconPicker extends React.Component<IIconPickerProps, IIconPickerState> {
    private radioIdBase: string = getId("radio");


    constructor(props: IIconPickerProps) {
        super(props);

        telemetry.track('IconPicker');

        this.state = {
            items: IconNames.Icons,
            isPanelOpen: false,
            currentIcon: this.props.currentIcon || null
        };
    }

    public render(): React.ReactElement<IIconPickerProps> {
        let { renderOption} = this.props;
        renderOption = renderOption === undefined ? 'Panel' : renderOption.toLowerCase()  === 'dialog' ? 'Dialog' : 'Panel';
        return <div>
            <PrimaryButton
                text={this.props.buttonLabel}
                onClick={this.iconPickerOnClick}
                className={this.props.buttonClassName}
                disabled={this.props.disabled}
                data-automation-id={`icon-picker-open`}
            />
            {

            renderOption == 'Panel'  ?
            <Panel
                isOpen={this.state.isPanelOpen}
                onDismiss={this.closePanel}
                type={PanelType.medium}
                data-automation-id={`icon-picker-panel`}
                closeButtonAriaLabel={strings.CloseButton}
                className={this.props.panelClassName}
                onRenderNavigation={this.renderPanelNav}
                onRenderFooterContent={this.renderPanelFooter}
            >
                {this.renderPanelContent()}
            </Panel>
            :
            <Dialog
            hidden={!this.state.isPanelOpen}
            onDismiss={this.closePanel}
            isBlocking={true}

            dialogContentProps={{
              type: DialogType.normal,
              title: strings.SelectIcon,
              showCloseButton: true,

            }}
            >
               <SearchBox className={styles.searchBox}
                onAbort={this.onAbort}
                data-automation-id={`icon-picker-search`}

                onChange={this.onChange} />
              <div className={styles.dialogIconsContainer}>
              {this.renderPanelContent()}
              </div>

              <DialogFooter>
              <div style={{display:'flex', flexDirection: 'row' , justifyContent:'flex-end', }}>
                <Icon iconName={this.state.currentIcon}  className={styles.dialogSelectedIcons}/>
              <PrimaryButton style={{marginRight: 5}} text={strings.SaveButtonLabel} onClick={this.confirmSelection} disabled={!this.state.currentIcon}  data-automation-id={`icon-picker-save`} />
              <DefaultButton text={strings.CancelButtonLabel} onClick={this.closePanel} className={styles.btnCancel} data-automation-id={`icon-picker-close`} />
              </div>
              </DialogFooter>
            </Dialog>

             }
        </div>;
    }

    private closePanel = (): void => {
        this.setState({
            currentIcon: null,
            isPanelOpen: false
        });
    }

    private iconPickerOnClick = (): void => {
        this.setState({
            isPanelOpen: true,
            items :IconNames.Icons
        });
    }

    private iconOnClick = (iconName: string): void => {
        if (this.props.onChange) this.props.onChange(iconName);
        console.log(iconName);
        this.setState({
            currentIcon: iconName,
        });
    }

    private onAbort = (): void => {
        this.setState({ items: IconNames.Icons });
    }

    private onChange = (newValue?: string): void => {
        let items: string[];
        if (newValue && newValue.trim().length > 2) {
            items = IconNames.Icons.filter(item => {
                return item.toLocaleLowerCase().indexOf(newValue.toLocaleLowerCase()) !== -1;
            });
        } else {
            items = IconNames.Icons;
        }
        this.setState({
            items: items
        });
    }

    private confirmSelection = (): void => {
        if (this.props.onSave) this.props.onSave(this.state.currentIcon);
        this.setState({
            isPanelOpen: false,
        });
    }

    private renderPanelNav: IRenderFunction<IPanelProps> = (props: IPanelProps, defaultRender: IRenderFunction<IPanelProps>) => {
        return <div className={styles.navArea}>
            <h2 className={styles.headTitle}>{strings.SelectIcon}</h2>
            <SearchBox className={styles.searchBox}
                onAbort={this.onAbort}
                data-automation-id={`icon-picker-search`}

                onChange={this.onChange} />
            <div className={styles.closeBtnContainer}>{defaultRender!(props)}</div>
        </div>;
    }

    private renderPanelContent = () => {
        return <div>
            {this.renderIcons()}
        </div>;
    }

    private renderPanelFooter: IRenderFunction<IPanelProps> = () => {
        return <div className={styles.footer} data-automation-id={`icon-picker-footer`}>
            <PrimaryButton text={strings.SaveButtonLabel} onClick={this.confirmSelection} disabled={!this.state.currentIcon} className={styles.btnSave} data-automation-id={`icon-picker-save`} />
            <div className={`${styles.selectionDisplay} ${!this.state.currentIcon ? 'noSelection' : ''}`}>
                <span className={styles.selectionLabel}>{strings.SelectedLabel}:</span>
                <Icon iconName={this.state.currentIcon} className={styles.selectionIcon} />
            </div>
            <DefaultButton text={strings.CancelButtonLabel} onClick={this.closePanel} className={styles.btnCancel} data-automation-id={`icon-picker-close`} />
        </div>;
    }

    private renderIcons = (): React.ReactElement<IIconPickerProps> => {
        return (<ul className={styles.iconList}>
            {this.state.items.map(this.renderIcon)}
        </ul>);
    }

    private renderIcon = (item: string): JSX.Element => {
        const radioId: string = `${this.radioIdBase}-${item}`;
        return <li className={styles.iconItem}>
            <input type="radio" name={this.radioIdBase} id={radioId} className={styles.iconRadio}
                data-automation-id={`icon-picker-${item}`}
                checked={item == this.state.currentIcon}
                onChange={() => this.iconOnClick(item)} />
            <label className={styles.iconLabel} htmlFor={radioId} title={item}>
                <Icon iconName={item} className={styles.iconGlyph} />
                <span className={styles.iconName}>{item}</span>
            </label>
        </li>;
    }
}
