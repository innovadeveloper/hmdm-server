# repositorio de íconos

El repositorio de íconos de la web se encuentra en : https://getbootstrap.com/docs/3.4/components/#glyphicons-glyphs
```html
<!-- ejemplo : glyphicon glyphicon-qrcode -->
<button type='button' class='btn btn-default' localized-title="button.qrcode"
        ng-if="hasPermission('enroll_devices')"
        ng-disabled="device.configuration.qrCodeKey == null"
        data-hint-key="hint.step.1"
        ng-click='showQrCode(device)'>
    <span class='glyphicon glyphicon-qrcode'></span>
</button>
```