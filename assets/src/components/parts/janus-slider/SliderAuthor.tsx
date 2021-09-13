import { AuthorPartComponentProps } from 'components/parts/types/parts';
import React, { CSSProperties, useEffect } from 'react';
import { SliderModel } from './schema';
import './Slider.scss';

const SliderAuthor: React.FC<AuthorPartComponentProps<SliderModel>> = (props) => {
  const { id, model } = props;

  const {
    x,
    y,
    z,
    height,
    width,
    customCssClass,
    label,
    maximum = 1,
    minimum = 0,
    snapInterval,
    showValueLabels,
    showLabel,
    invertScale,
  } = model;

  const styles: CSSProperties = {
    flexDirection: showLabel ? 'column' : 'row',
  };
  const inputStyles: CSSProperties = {
    width: '100%',
    height: `${height}px`,
    zIndex: z,
    direction: invertScale ? 'rtl' : 'ltr',
  };
  const divStyles: CSSProperties = {
    width: '100%',
    display: `flex`,
    flexDirection: 'row',
  };

  useEffect(() => {
    // all activities *must* emit onReady
    props.onReady({ id: `${props.id}` });
  }, []);

  const internalId = `${id}__slider`;

  return (
    <div data-janus-type={tagName} style={styles} className={`slider`}>
      <div className="sliderInner">
        {showValueLabels && <label htmlFor={internalId}>{invertScale ? maximum : minimum}</label>}
        <div className="rangeWrap">
          <div style={divStyles}>
            <input
              disabled={true}
              style={inputStyles}
              min={minimum}
              max={maximum}
              type={'range'}
              step={snapInterval}
              className={` slider ` + customCssClass}
              id={internalId}
            />
          </div>
        </div>
        {showValueLabels && <label htmlFor={internalId}>{invertScale ? minimum : maximum}</label>}
      </div>
      {showLabel && (
        <label className="input-label" htmlFor={internalId}>
          {label}
        </label>
      )}
    </div>
  );
};

export const tagName = 'janus-slider';

export default SliderAuthor;
