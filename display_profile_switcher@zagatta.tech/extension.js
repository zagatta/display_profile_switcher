const { St, GLib, Clutter } = imports.gi;
const Main = imports.ui.main;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const layout_path = '.screenlayout/'
const ls = 'ls ';
const cmd_get_profiles = ls.concat(layout_path);
const cmd_get_user = 'logname';
const ByteArray = imports.byteArray;
const sh = ".sh";

let myPopup;
let home = '/home/';

const MyPopup = GObject.registerClass(
  class MyPopup extends PanelMenu.Button {

    _init() {

      super._init(0);

      let icon = new St.Icon({
        gicon: Gio.icon_new_for_string(Me.dir.get_path() + '/icon.svg'),
        style_class: 'system-status-icon',
      });

      this.add_child(icon);

      var arr = [];

      var [ok, out, err, exit] = GLib.spawn_command_line_sync(
        cmd_get_profiles);

      var profiles = ByteArray.toString(out).replace(' ', '').split('\n');


      for (var index = 0; index < profiles.length; ++index) {
        if (!(profiles[index].includes(sh))) { break; }
        let profile_name = profiles[index].replace(sh, '');
        let pmItem = new PopupMenu.PopupMenuItem(profile_name);
        this.menu.addMenuItem(pmItem);
        pmItem.connect('activate', () => {
          var cmd_activate_profile = home.concat(layout_path, profile_name, sh);
          log(cmd_activate_profile);
          var [ok, out, err, exit] = GLib.spawn_command_line_sync(
            cmd_activate_profile);
          log(out.toString())
        });
      }

    }

  });

function init() {
  var [ok, out, err, exit] = GLib.spawn_command_line_sync(
    cmd_get_user);
  var username = ByteArray.toString(out);
  username = username.replace('\n', '');
  home = home.concat(username, "/");
}

function enable() {
  myPopup = new MyPopup();
  Main.panel.addToStatusArea('myPopup', myPopup, 1);
}

function disable() {
  myPopup.destroy();
}
