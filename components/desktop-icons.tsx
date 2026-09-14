type IconProps={size?:number;className?:string};

function PixelIcon({name,size=16,className=''}:IconProps&{name:string}) {
  const sourceSize=size>=32?32:16;
  return <img className={`pixel-icon ${className}`} src={`/assets/pixel-icons/${name}_${sourceSize}x${sourceSize}_4.png`} width={size} height={size} style={{width:size,height:size}} alt="" aria-hidden="true" draggable={false}/>;
}

export const FileText=(props:IconProps)=><PixelIcon name="Notepad" {...props}/>;
export const FolderOpen=(props:IconProps)=><PixelIcon name="FolderOpen" {...props}/>;
export const Mail=(props:IconProps)=><PixelIcon name="Mail" {...props}/>;
export const Monitor=(props:IconProps)=><PixelIcon name="Computer" {...props}/>;
export const ImageIcon=(props:IconProps)=><PixelIcon name="Camera" {...props}/>;
